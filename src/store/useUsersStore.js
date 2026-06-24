import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Admin user-management state. Reads the profiles table (admins can see every
// row via RLS) and lets an admin change a user's role. Creating brand-new
// accounts requires the privileged service_role key, so inviting is done from
// the Supabase dashboard for now (see SUPABASE_SETUP.md).
const useUsersStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,

  async listUsers() {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, title, role, disabled, created_at')
      .order('created_at', { ascending: true });
    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({ users: data || [], loading: false });
  },

  // Change a user's role. Role writes are not allowed from the browser (no
  // client UPDATE policy on profiles); they go through the server endpoint,
  // which holds the service_role key and enforces the role hierarchy (admins
  // can only manage analysts; only super-admins can grant/modify super-admin).
  async setUserRole(id, role) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return { error: 'Your session has expired — sign in again.' };

    let res, body;
    try {
      res = await fetch('/api/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetId: id, role }),
      });
      body = await res.json();
    } catch {
      return { error: 'Could not reach the role service.' };
    }
    if (!res.ok) return { error: body?.error || 'Role change failed.' };
    // Reflect the change locally without a refetch.
    set(s => ({ users: s.users.map(u => (u.id === id ? { ...u, role } : u)) }));
    return { error: null };
  },

  // Invite a new user by email. Calls the server endpoint (which holds the
  // service_role key and verifies we're an admin) with our access token. The
  // optional `title` describes the account's position (functional mailboxes).
  async inviteUser(email, title) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return { error: 'Your session has expired — sign in again.' };

    let res, body;
    try {
      res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email: email.trim(),
          title: (title || '').trim() || undefined,
          redirectTo: `${window.location.origin}/set-password`,
        }),
      });
      body = await res.json();
    } catch {
      return { error: 'Could not reach the invite service.' };
    }
    if (!res.ok) return { error: body?.error || 'Invitation failed.' };
    await get().listUsers(); // surface the newly invited user
    return { error: null };
  },

  // Shared helper for the privileged account-management endpoint.
  async _manageUser(payload) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return { error: 'Your session has expired — sign in again.' };
    let res, body;
    try {
      res = await fetch('/api/manage-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      body = await res.json();
    } catch {
      return { error: 'Could not reach the account service.' };
    }
    if (!res.ok) return { error: body?.error || 'Action failed.' };
    return { body };
  },

  // Rename an account's position/title.
  async setUserTitle(id, title) {
    const { error } = await get()._manageUser({ action: 'set-title', targetId: id, title });
    if (error) return { error };
    set(s => ({ users: s.users.map(u => (u.id === id ? { ...u, title: (title || '').trim() || null } : u)) }));
    return { error: null };
  },

  // Disable (off-board) or re-enable an account. Super-admin only (enforced
  // server-side); blocks sign-in at the auth layer.
  async setUserDisabled(id, disabled) {
    const { error } = await get()._manageUser({ action: disabled ? 'disable' : 'enable', targetId: id });
    if (error) return { error };
    set(s => ({ users: s.users.map(u => (u.id === id ? { ...u, disabled } : u)) }));
    return { error: null };
  },

  // Send a password-reset email to an account (e.g. to hand a functional
  // mailbox to a successor). This is a plain Supabase recovery email — no
  // privileged access needed — so it's done directly from the client.
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/set-password`,
    });
    if (error) return { error: error.message };
    return { error: null };
  },
}));

export default useUsersStore;
