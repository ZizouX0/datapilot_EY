// Framework-agnostic core for inviting a new user. Shared by the Vite dev
// middleware (local `npm run dev`) and the Vercel serverless function
// (`api/invite.js`) so there is exactly one code path.
//
// This runs SERVER-SIDE ONLY. It uses the Supabase service_role key, which
// bypasses Row Level Security and must never reach the browser. The caller's
// own access token is verified first and must belong to an admin, so the
// endpoint cannot be used by analysts or anonymous visitors.
import { createClient } from '@supabase/supabase-js';
import { ROLE_RANK, rank, invitableRole } from './_roles.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function inviteUserCore({ token, email, redirectTo, title, role, bank }) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw fail(503, 'User invitations are not configured on the server (missing SUPABASE_SERVICE_ROLE_KEY).');
  }
  if (!token) throw fail(401, 'Not authenticated.');
  if (!email || !EMAIL_RE.test(String(email).trim())) throw fail(400, 'A valid email address is required.');

  // Service-role client — full access, used only after we confirm the caller.
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1) Identify the caller from their access token.
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) throw fail(401, 'Invalid or expired session.');

  // 2) Confirm the caller is an admin or super-admin. We also read the caller's
  //    bank so the invitee inherits it (per-inviter tree: super-admin → admin →
  //    analyst all share one bank).
  const { data: profile, error: profErr } = await admin
    .from('profiles').select('role, bank_name').eq('id', userData.user.id).single();
  if (profErr) throw fail(403, 'Could not verify your permissions.');
  const callerRole = profile?.role;
  if (rank(callerRole) < ROLE_RANK.admin) {
    throw fail(403, 'Administrator access required.');
  }
  const inviterBank = profile?.bank_name || null;
  const callerId = userData.user.id;

  // 3) Delegated invites are strictly one step down: EY → superadmin → admin →
  //    analyst. The invitee's role is fixed by the caller's tier; if the client
  //    sends one it must match.
  const wantRole = invitableRole(callerRole);
  if (!wantRole) throw fail(403, 'You are not allowed to invite users.');
  if (role && role !== wantRole) {
    throw fail(403, `You can only invite a ${wantRole}.`);
  }

  // 4) Resolve the bank. Only an EY owner names the bank (they invite a bank's
  //    Super Admin); for everyone else the invitee inherits the inviter's bank.
  let effectiveBank;
  if (callerRole === 'owner') {
    const cleanBank = typeof bank === 'string' ? bank.trim() : '';
    if (!cleanBank) throw fail(400, 'A bank name is required when inviting a Super Admin.');
    effectiveBank = cleanBank;
  } else {
    effectiveBank = inviterBank; // inherited; any passed bank is ignored
  }

  // 5) Send the invitation. Creates the auth user (the DB trigger creates their
  //    profile) and emails them a link to set a password. Title and bank ride
  //    along as metadata; the handle_new_user trigger copies them onto the
  //    profile. Role is applied as an explicit update below (the trigger always
  //    defaults new profiles to analyst).
  const options = {};
  if (redirectTo) options.redirectTo = redirectTo;
  const cleanTitle = typeof title === 'string' ? title.trim() : '';
  const meta = {};
  if (cleanTitle) meta.title = cleanTitle;
  if (effectiveBank) meta.bank_name = effectiveBank;
  if (Object.keys(meta).length) options.data = meta;
  const { data, error } = await admin.auth.admin.inviteUserByEmail(
    String(email).trim(),
    Object.keys(options).length ? options : undefined,
  );
  if (error) throw fail(400, error.message);

  // 6) Apply role, bank and lineage on the new profile. Covers the case where
  //    the trigger ran before the metadata was visible, and records who invited
  //    them (for the per-bank org tree).
  const newUserId = data?.user?.id || null;
  if (newUserId) {
    const patch = { invited_by: callerId };
    if (wantRole !== 'analyst') patch.role = wantRole;
    if (effectiveBank) patch.bank_name = effectiveBank;
    await admin.from('profiles').update(patch).eq('id', newUserId);
  }

  return { ok: true, userId: newUserId };
}
