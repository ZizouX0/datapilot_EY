import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Admin user-management state. Reads the profiles table (admins can see every
// row via RLS) and lets an admin change a user's role. Creating brand-new
// accounts requires the privileged service_role key, so inviting is done from
// the Supabase dashboard for now (see SUPABASE_SETUP.md).
const useUsersStore = create((set) => ({
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
}));

export default useUsersStore;
