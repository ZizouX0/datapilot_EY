// Framework-agnostic core for post-centric account management: renaming the
// account's position/title and disabling/enabling it during off-boarding.
// Shared by the Vite dev middleware and the Vercel function (api/manage-user.js).
//
// SERVER-SIDE ONLY — uses the service_role key (bypasses RLS). The caller's
// access token is verified and the role hierarchy is enforced here, the same
// way /api/set-role does it. Password resets are NOT here: they are a plain
// recovery email sent client-side (no privileged access needed).
import { createClient } from '@supabase/supabase-js';
import { ROLE_RANK, rank } from './_roles.js';

const ACTIONS = ['set-title', 'disable', 'enable'];
// Far-future ban = effectively disabled. 'none' lifts the ban (re-enable).
const BAN_FOREVER = '876000h'; // ~100 years

function fail(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function manageUserCore({ token, action, targetId, title }) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw fail(503, 'Account management is not configured on the server (missing SUPABASE_SERVICE_ROLE_KEY).');
  }
  if (!token) throw fail(401, 'Not authenticated.');
  if (!ACTIONS.includes(action)) throw fail(400, 'Unknown action.');
  if (!targetId) throw fail(400, 'A target user id is required.');

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1) Identify the caller and their role.
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) throw fail(401, 'Invalid or expired session.');
  const callerId = userData.user.id;

  const { data: caller, error: callerErr } = await admin
    .from('profiles').select('role, bank_name, disabled').eq('id', callerId).single();
  if (callerErr) throw fail(403, 'Could not verify your permissions.');
  if (caller?.disabled) throw fail(403, 'Your account has been disabled.');
  const callerRole = caller?.role;
  if (rank(callerRole) < ROLE_RANK.admin) {
    throw fail(403, 'Administrator access required.');
  }

  // 2) Load the target.
  const { data: target, error: targetErr } = await admin
    .from('profiles').select('role, bank_name').eq('id', targetId).single();
  if (targetErr || !target) throw fail(404, 'That user no longer exists.');

  // You may never act on an account at or above your own level — only on
  // strictly-lower ranks (matching set-role / set-department). Acting on your
  // own account is still allowed (e.g. nothing here mutates it harmfully; the
  // disable path separately blocks self below). This stops an admin from
  // renaming a peer admin, or a super-admin a peer super-admin.
  if (targetId !== callerId && rank(target.role) >= rank(callerRole)) {
    throw fail(403, 'You cannot manage an account at or above your level.');
  }
  // Non-EY callers are confined to their own bank.
  if (callerRole !== 'owner' && (!caller?.bank_name || caller.bank_name !== target.bank_name)) {
    throw fail(403, 'You can only manage users in your own bank.');
  }

  // 3) Perform the action.
  if (action === 'set-title') {
    const { error } = await admin
      .from('profiles').update({ title: (title || '').trim() || null }).eq('id', targetId);
    if (error) throw fail(400, error.message);
    return { ok: true, id: targetId, title: (title || '').trim() || null };
  }

  // disable / enable are powerful off-boarding actions — super-admin and above
  // only, and never on your own account (so you can't lock yourself out).
  if (rank(callerRole) < ROLE_RANK.superadmin) {
    throw fail(403, 'Only a super-admin can enable or disable accounts.');
  }
  if (targetId === callerId) throw fail(403, "You can't disable your own account.");

  const disabled = action === 'disable';
  // Ban (or unban) at the auth layer — this is what actually blocks sign-in.
  const { error: banErr } = await admin.auth.admin.updateUserById(targetId, {
    ban_duration: disabled ? BAN_FOREVER : 'none',
  });
  if (banErr) throw fail(400, banErr.message);
  // Mirror onto the profile so the Users table can show the status.
  const { error: updErr } = await admin
    .from('profiles').update({ disabled }).eq('id', targetId);
  if (updErr) throw fail(400, updErr.message);

  return { ok: true, id: targetId, disabled };
}
