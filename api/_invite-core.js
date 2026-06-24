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

  // 2) Confirm the caller is an admin (service role bypasses RLS here).
  const { data: profile, error: profErr } = await admin
    .from('profiles').select('role').eq('id', userData.user.id).single();
  if (profErr) throw fail(403, 'Could not verify your permissions.');
  if (profile?.role !== 'admin') throw fail(403, 'Administrator access required.');

  // 3) Send the invitation. Creates the auth user (the DB trigger then creates
  //    their profile as an analyst) and emails them a link to set a password.
  //    The optional title (account's position) is passed as user metadata; the
  //    trigger copies it onto the profile.
  const options = {};
  if (redirectTo) options.redirectTo = redirectTo;
  const cleanTitle = typeof title === 'string' ? title.trim() : '';
  if (cleanTitle) options.data = { title: cleanTitle };
  const { data, error } = await admin.auth.admin.inviteUserByEmail(
    String(email).trim(),
    Object.keys(options).length ? options : undefined,
  );
  if (error) throw fail(400, error.message);

  return { ok: true, userId: data?.user?.id || null };
}
