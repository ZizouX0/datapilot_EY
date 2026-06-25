// Framework-agnostic core for a user editing their OWN account fields
// (display name, language). Shared by the Vite dev middleware and the Vercel
// function (api/update-self.js).
//
// SERVER-SIDE ONLY — uses the service_role key. The profiles table is not
// client-writable (Phase 3 removed all client UPDATE policies so nobody can
// edit their own `role`); this endpoint re-opens writes for a strict whitelist
// of harmless self-service fields ONLY, after verifying the caller owns the row.
import { createClient } from '@supabase/supabase-js';

const LANGUAGES = ['en', 'fr'];

function fail(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

const PHONE_RE = /^\+?[0-9 ()-]{6,20}$/;

export async function updateSelfCore({ token, fullName, language, avatarUrl, phone, bankName }) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw fail(503, 'Profile editing is not configured on the server (missing SUPABASE_SERVICE_ROLE_KEY).');
  }
  if (!token) throw fail(401, 'Not authenticated.');

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Identify the caller; they can only ever update their own row.
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) throw fail(401, 'Invalid or expired session.');
  const callerId = userData.user.id;

  // Build a whitelisted patch. role / disabled / email are intentionally NOT
  // accepted here — those are admin-controlled.
  const patch = {};
  if (fullName !== undefined) {
    patch.full_name = String(fullName).trim() || null;
  }
  if (language !== undefined) {
    if (!LANGUAGES.includes(language)) throw fail(400, 'Unsupported language.');
    patch.language = language;
  }
  if (avatarUrl !== undefined) {
    const v = avatarUrl === null ? null : String(avatarUrl).trim();
    if (v && !/^https?:\/\//i.test(v)) throw fail(400, 'Invalid avatar URL.');
    patch.avatar_url = v || null;
  }
  if (phone !== undefined) {
    const v = phone === null ? '' : String(phone).trim();
    if (v && !PHONE_RE.test(v)) throw fail(400, 'Invalid phone number.');
    patch.phone = v || null;
  }
  // bank_name is the tenant identifier: an EY owner assigns it when inviting a
  // bank's Super Admin, and it cascades down on every further invite. It is
  // therefore read-only in-app and intentionally NOT accepted here (changing it
  // would split a bank's tree across tenants). `bankName` is ignored.
  void bankName;
  if (Object.keys(patch).length === 0) throw fail(400, 'Nothing to update.');

  const { error } = await admin.from('profiles').update(patch).eq('id', callerId);
  if (error) throw fail(400, error.message);

  return { ok: true, ...patch };
}
