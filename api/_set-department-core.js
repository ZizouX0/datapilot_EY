// Framework-agnostic core for assigning a user to a department. Shared by the
// Vite dev middleware and the Vercel serverless function (api/set-department.js).
//
// SERVER-SIDE ONLY. Uses the Supabase service_role key (bypasses RLS) because
// profiles.department_id is not client-writable — like role changes, department
// assignment must go through one trusted place. Only a super-admin (or EY owner)
// may assign people to departments, and only within their own bank.
import { createClient } from '@supabase/supabase-js';
import { rank, ROLE_RANK } from './_roles.js';

function fail(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function setDepartmentCore({ token, targetId, departmentId }) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw fail(503, 'Department assignment is not configured on the server (missing SUPABASE_SERVICE_ROLE_KEY).');
  }
  if (!token) throw fail(401, 'Not authenticated.');
  if (!targetId) throw fail(400, 'A target user id is required.');

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1) Identify the caller.
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) throw fail(401, 'Invalid or expired session.');
  const callerId = userData.user.id;

  // 2) Caller must be a super-admin or owner.
  const { data: caller, error: callerErr } = await admin
    .from('profiles').select('role, bank_name').eq('id', callerId).single();
  if (callerErr) throw fail(403, 'Could not verify your permissions.');
  if (rank(caller?.role) < ROLE_RANK.superadmin) {
    throw fail(403, 'Super-admin access required to assign departments.');
  }

  // 3) Load the target; confine non-EY callers to their own bank.
  const { data: target, error: targetErr } = await admin
    .from('profiles').select('role, bank_name').eq('id', targetId).single();
  if (targetErr || !target) throw fail(404, 'That user no longer exists.');
  if (caller.role !== 'owner' && (!caller.bank_name || caller.bank_name !== target.bank_name)) {
    throw fail(403, 'You can only manage users in your own bank.');
  }

  // 4) Validate the department (null clears the assignment). It must belong to
  //    the target's bank so a user can't be put in another bank's department.
  const deptId = departmentId || null;
  if (deptId) {
    const { data: dept, error: deptErr } = await admin
      .from('departments').select('id, bank_name').eq('id', deptId).single();
    if (deptErr || !dept) throw fail(404, 'That department no longer exists.');
    if (dept.bank_name !== target.bank_name) {
      throw fail(400, 'That department belongs to another bank.');
    }
  }

  // 5) Apply.
  const { error: updErr } = await admin
    .from('profiles').update({ department_id: deptId }).eq('id', targetId);
  if (updErr) throw fail(400, updErr.message);

  return { ok: true, id: targetId, departmentId: deptId };
}
