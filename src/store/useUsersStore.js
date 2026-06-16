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
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: true });
    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({ users: data || [], loading: false });
  },

  async setUserRole(id, role) {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) return { error: error.message };
    // Reflect the change locally without a refetch.
    set(s => ({ users: s.users.map(u => (u.id === id ? { ...u, role } : u)) }));
    return { error: null };
  },

  // Invite a new user by email. Calls the server endpoint (which holds the
  // service_role key and verifies we're an admin) with our access token.
  async inviteUser(email) {
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
}));

export default useUsersStore;
