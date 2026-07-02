// Framework-agnostic core for changing a user's role. Shared by the Vite dev
// middleware (local `npm run dev`) and the Vercel serverless function
// (`api/set-role.js`) so there is exactly one code path.
//
// This runs SERVER-SIDE ONLY. It uses the Supabase service_role key, which
// bypasses Row Level Security and must never reach the browser. Role changes are
// deliberately NOT possible from the browser (no client UPDATE policy on
// profiles, see supabase/phase3.sql); they must go through here so the role
// hierarchy is enforced in one trusted place.
import { createClient } from '@supabase/supabase-js';
import { ROLES, ROLE_RANK, rank } from './_roles.js';

function fail(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function setRoleCore({ token, targetId, role }) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw fail(503, 'Role management is not configured on the server (missing SUPABASE_SERVICE_ROLE_KEY).');
  }
  if (!token) throw fail(401, 'Not authenticated.');
  if (!targetId) throw fail(400, 'A target user id is required.');
  if (!ROLES.includes(role)) throw fail(400, 'Invalid role.');

  // Service-role client — full access, used only after we confirm the caller.
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1) Identify the caller from their access token.
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) throw fail(401, 'Invalid or expired session.');
  const callerId = userData.user.id;

  // 2) Load the caller's role/bank and the target's current role/bank.
  const { data: caller, error: callerErr } = await admin
    .from('profiles').select('role, bank_name, disabled').eq('id', callerId).single();
  if (callerErr) throw fail(403, 'Could not verify your permissions.');
  if (caller?.disabled) throw fail(403, 'Your account has been disabled.');
  const callerRole = caller?.role;
  if (rank(callerRole) < ROLE_RANK.admin) {
    throw fail(403, 'Administrator access required.');
  }

  const { data: target, error: targetErr } = await admin
    .from('profiles').select('role, bank_name').eq('id', targetId).single();
  if (targetErr || !target) throw fail(404, 'That user no longer exists.');
  const targetRole = target.role;

  // 3) Enforce the hierarchy (owner > superadmin > admin > analyst).
  // Nobody can change their own role (prevents self-escalation and lock-out).
  if (targetId === callerId) throw fail(403, "You can't change your own role.");
  // Non-EY callers are confined to their own bank.
  if (callerRole !== 'owner' && (!caller?.bank_name || caller.bank_name !== target.bank_name)) {
    throw fail(403, 'You can only manage users in your own bank.');
  }
  // You can only set a role STRICTLY below your own (no peers, no superiors)…
  if (rank(role) >= rank(callerRole)) {
    throw fail(403, 'You cannot grant a role at or above your own.');
  }
  // …and you can only change someone who is strictly below you.
  if (rank(targetRole) >= rank(callerRole)) {
    throw fail(403, 'You cannot change the role of someone at or above your level.');
  }

  if (role === targetRole) {
    return { ok: true, id: targetId, role }; // no-op, idempotent
  }

  // 4) Apply the change.
  const { error: updErr } = await admin
    .from('profiles').update({ role }).eq('id', targetId);
  if (updErr) throw fail(400, updErr.message);

  return { ok: true, id: targetId, role };
}
