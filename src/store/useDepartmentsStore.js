import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import useAuthStore from './useAuthStore';
import { TUNISIA_DEFAULT_DEPARTMENTS } from '../data/tunisiaDefaults';

// Departments are per-bank and managed by a coordinator. All reads/writes go
// straight through the browser client — RLS on `departments` (see phase4.sql)
// scopes them to the caller's bank (owner sees all) and limits writes to bank
// admins/super-admins. Assigning a USER to a department is the one exception:
// it writes profiles.department_id, which is not client-writable, so it goes
// through /api/set-department (see useUsersStore.setUserDepartment).
const byName = (a, b) => a.name.localeCompare(b.name);

const useDepartmentsStore = create((set, get) => ({
  departments: [],
  loading: false,
  error: null,

  async list() {
    if (!isSupabaseConfigured) { set({ error: 'Backend not configured.' }); return; }
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('departments')
      .select('id, bank_name, name, created_at')
      .order('name', { ascending: true });
    if (error) { set({ loading: false, error: error.message }); return; }
    set({ departments: data || [], loading: false });
  },

  async create(name) {
    const bank = useAuthStore.getState().bankName;
    if (!bank) return { error: 'Your account has no bank set.' };
    const clean = (name || '').trim();
    if (!clean) return { error: 'A department name is required.' };
    const { data, error } = await supabase
      .from('departments')
      .insert({ bank_name: bank, name: clean })
      .select('id, bank_name, name, created_at')
      .single();
    if (error) return { error: error.code === '23505' ? 'DUPLICATE' : error.message };
    set(s => ({ departments: [...s.departments, data].sort(byName) }));
    return { data };
  },

  async rename(id, name) {
    const clean = (name || '').trim();
    if (!clean) return { error: 'A department name is required.' };
    const { error } = await supabase.from('departments').update({ name: clean }).eq('id', id);
    if (error) return { error: error.code === '23505' ? 'DUPLICATE' : error.message };
    set(s => ({ departments: s.departments.map(d => (d.id === id ? { ...d, name: clean } : d)).sort(byName) }));
    return { error: null };
  },

  // Deleting a department leaves its members unassigned (profiles.department_id
  // is ON DELETE SET NULL) and clears any dimension assignments referencing it.
  async remove(id) {
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) return { error: error.message };
    set(s => ({ departments: s.departments.filter(d => d.id !== id) }));
    return { error: null };
  },

  // One-click: create any of the standard Tunisian-bank departments that don't
  // already exist for this bank. Idempotent — skips names already present.
  async seedTunisiaDefaults() {
    const bank = useAuthStore.getState().bankName;
    if (!bank) return { error: 'Your account has no bank set.' };
    const existing = new Set(get().departments.map(d => d.name));
    const rows = TUNISIA_DEFAULT_DEPARTMENTS
      .filter(n => !existing.has(n))
      .map(name => ({ bank_name: bank, name }));
    if (!rows.length) return { error: null, added: 0 };
    const { error } = await supabase.from('departments').insert(rows);
    if (error) return { error: error.message };
    await get().list();
    return { error: null, added: rows.length };
  },
}));

export default useDepartmentsStore;
