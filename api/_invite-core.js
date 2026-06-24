// Framework-agnostic core for inviting a new user. Shared by the Vite dev
// middleware (local `npm run dev`) and the Vercel serverless function
// (`api/invite.js`) so there is exactly one code path.
//
// This runs SERVER-SIDE ONLY. It uses the Supabase service_role key, which
// bypasses Row Level Security and must never reach the browser. The caller's
// own access token is verified first and must belong to an admin, so the
// endpoint cannot be used by analysts or anonymous visitors.
import { createClient } from '@supabase/supabase-js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function inviteUserCore({ token, email, redirectTo, title }) {
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
  if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
    throw fail(403, 'Administrator access required.');
  }
  const inviterBank = profile?.bank_name || null;

  // 3) Send the invitation. Creates the auth user (the DB trigger then creates
  //    their profile as an analyst) and emails them a link to set a password.
  //    Title (position) and the inviter's bank are passed as user metadata; the
  //    handle_new_user trigger copies both onto the new profile.
  const options = {};
  if (redirectTo) options.redirectTo = redirectTo;
  const cleanTitle = typeof title === 'string' ? title.trim() : '';
  const meta = {};
  if (cleanTitle) meta.title = cleanTitle;
  if (inviterBank) meta.bank_name = inviterBank;
  if (Object.keys(meta).length) options.data = meta;
  const { data, error } = await admin.auth.admin.inviteUserByEmail(
    String(email).trim(),
    Object.keys(options).length ? options : undefined,
  );
  if (error) throw fail(400, error.message);

  // Defensive: ensure the bank landed on the profile even if the trigger ran
  // before the metadata was visible. No-op when already set by the trigger.
  const newUserId = data?.user?.id || null;
  if (newUserId && inviterBank) {
    await admin.from('profiles').update({ bank_name: inviterBank }).eq('id', newUserId);
  }

  return { ok: true, userId: newUserId };
}
