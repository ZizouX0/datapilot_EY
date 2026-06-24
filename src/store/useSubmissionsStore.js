import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Centralized assessment submissions. Analysts send a completed assessment in
// (saveSubmission); admins / super-admins review every submission, analysts see
// only their own. RLS on the `submissions` table (see supabase/phase3.sql) is
// what actually scopes the rows — listSubmissions() just reads what the caller
// is allowed to read.
const useSubmissionsStore = create((set) => ({
  submissions: [],   // list rows (without the heavy answers payload)
  loading: false,
  error: null,
  saving: false,

  // List submissions visible to the signed-in user. The list view omits the
  // bulky `answers` blob; the full row is fetched on demand by getSubmission().
  async listSubmissions() {
    if (!isSupabaseConfigured) {
      set({ error: 'Backend not configured.', loading: false });
      return;
    }
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('submissions')
      .select('id, analyst_id, analyst_email, bank_name, respondent_name, respondent_role, assessment_date, global_score, maturity_level, bct_rate, target_level, dimension_scores, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({ submissions: data || [], loading: false });
  },

  // Fetch one submission in full (including answers + profile snapshot) for the
  // detailed review panel.
  async getSubmission(id) {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return { error: error.message };
    return { data };
  },

  // Persist a completed assessment. `payload` is built by useAppStore's
  // buildSubmission() selector. analyst_id is set from the session so it always
  // matches the RLS insert check (auth.uid() = analyst_id).
  async saveSubmission(payload) {
    if (!isSupabaseConfigured) return { error: 'Backend not configured.' };
    set({ saving: true, error: null });
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      set({ saving: false });
      return { error: 'Your session has expired — sign in again.' };
    }
    const row = { ...payload, analyst_id: user.id, analyst_email: user.email };
    const { data, error } = await supabase
      .from('submissions')
      .insert(row)
      .select('id, created_at')
      .single();
    set({ saving: false });
    if (error) return { error: error.message };
    return { data };
  },

  // Remove a submission (own draft, or any if admin — enforced by RLS).
  async deleteSubmission(id) {
    const { error } = await supabase.from('submissions').delete().eq('id', id);
    if (error) return { error: error.message };
    set(s => ({ submissions: s.submissions.filter(x => x.id !== id) }));
    return { error: null };
  },
}));

export default useSubmissionsStore;
