import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import useAuthStore from './useAuthStore';
import { DIMENSIONS } from '../data/indicators';
import { TUNISIA_SUGGESTED_MAPPING } from '../data/tunisiaDefaults';
import { computeScores, answersFromRows } from '../lib/scoring';

// The shared, server-side "group" (Model B) assessment. One draft per bank:
// a coordinator (admin / super-admin) creates it and maps each dimension to a
// department; analysts fill only their department's dimensions on the shared
// draft; the coordinator finalizes it into a `submissions` row (the existing
// review/export pipeline). Every read/write below is gated by RLS in
// phase4.sql — this store just calls what the caller is permitted to do.
const useAssessmentStore = create((set, get) => ({
  assessment: null,    // the active assessment row (draft or finalized), or null
  assignments: [],     // [{ assessment_id, dim_code, department_id }]
  answers: {},         // { indicatorId: { score, evidence, skipped } }
  loading: false,
  saving: false,
  error: null,

  // Load the bank's most recent assessment plus its assignments and answers.
  // (RLS already restricts rows to the caller's bank, so "most recent" is the
  // bank's current assessment.) Leaves assessment null if none exists yet.
  async loadActive() {
    if (!isSupabaseConfigured) { set({ error: 'Backend not configured.' }); return; }
    set({ loading: true, error: null });
    const { data: rows, error } = await supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) { set({ loading: false, error: error.message }); return; }
    const assessment = rows?.[0] || null;
    if (!assessment) {
      set({ assessment: null, assignments: [], answers: {}, loading: false });
      return;
    }
    await get()._loadDetails(assessment);
    set({ assessment, loading: false });
  },

  async _loadDetails(assessment) {
    const [{ data: asg }, { data: ans }] = await Promise.all([
      supabase.from('assessment_assignments').select('*').eq('assessment_id', assessment.id),
      supabase.from('assessment_answers').select('*').eq('assessment_id', assessment.id),
    ]);
    set({ assignments: asg || [], answers: answersFromRows(ans) });
  },

  // Coordinator: start a fresh draft for the bank.
  async createAssessment({ title, targetLevel = 3 } = {}) {
    const { bankName, user } = useAuthStore.getState();
    if (!bankName) return { error: 'Your account has no bank set.' };
    const { data, error } = await supabase
      .from('assessments')
      .insert({
        bank_name: bankName,
        title: (title || '').trim() || null,
        target_level: targetLevel,
        created_by: user?.id || null,
      })
      .select('*')
      .single();
    if (error) return { error: error.message };
    set({ assessment: data, assignments: [], answers: {} });
    return { data };
  },

  // Coordinator: set (or clear) the department that owns a dimension.
  async setAssignment(dimCode, departmentId) {
    const a = get().assessment;
    if (!a) return { error: 'No active assessment.' };
    const row = { assessment_id: a.id, dim_code: dimCode, department_id: departmentId || null };
    const { error } = await supabase
      .from('assessment_assignments')
      .upsert(row, { onConflict: 'assessment_id,dim_code' });
    if (error) return { error: error.message };
    set(s => ({ assignments: [...s.assignments.filter(x => x.dim_code !== dimCode), row] }));
    return { error: null };
  },

  // Coordinator: apply the suggested Tunisian mapping in one go. `departments`
  // is the list from useDepartmentsStore; matched to dimensions by name.
  async applySuggestedMapping(departments) {
    const a = get().assessment;
    if (!a) return { error: 'No active assessment.' };
    const idByName = new Map((departments || []).map(d => [d.name, d.id]));
    const rows = Object.entries(TUNISIA_SUGGESTED_MAPPING)
      .filter(([dim]) => DIMENSIONS[dim])
      .map(([dim, deptName]) => ({
        assessment_id: a.id,
        dim_code: dim,
        department_id: idByName.get(deptName) || null,
      }));
    if (!rows.length) return { error: 'No matching dimensions to map.' };
    const { error } = await supabase
      .from('assessment_assignments')
      .upsert(rows, { onConflict: 'assessment_id,dim_code' });
    if (error) return { error: error.message };
    await get()._loadDetails(a);
    return { error: null };
  },

  // The dimension codes the signed-in analyst's department is responsible for.
  myAssignedDims() {
    const deptId = useAuthStore.getState().departmentId;
    if (!deptId) return [];
    return get().assignments
      .filter(x => x.department_id === deptId)
      .map(x => x.dim_code);
  },

  // The department id assigned to a dimension (or null).
  departmentForDim(dimCode) {
    return get().assignments.find(x => x.dim_code === dimCode)?.department_id || null;
  },

  // Analyst: save one answer on the shared draft. RLS lets this through only
  // when the caller is an analyst whose department owns `dimCode`.
  async saveAnswer(indicatorId, dimCode, patch) {
    const a = get().assessment;
    if (!a) return { error: 'No active assessment.' };
    if (a.status !== 'draft') return { error: 'This assessment is finalized.' };
    const user = useAuthStore.getState().user;
    const next = { ...(get().answers[indicatorId] || {}), ...patch };
    const row = {
      assessment_id: a.id,
      indicator_id: indicatorId,
      dim_code: dimCode,
      score: next.score ?? null,
      evidence: next.evidence ?? null,
      skipped: next.skipped ?? false,
      answered_by: user?.id || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('assessment_answers')
      .upsert(row, { onConflict: 'assessment_id,indicator_id' });
    if (error) return { error: error.message };
    set(s => ({
      answers: {
        ...s.answers,
        [indicatorId]: { score: row.score, evidence: row.evidence, skipped: row.skipped },
      },
    }));
    return { error: null };
  },

  // Live headline scores for the current shared answers (no DB write).
  scores() {
    return computeScores(get().answers);
  },

  // Coordinator: finalize the draft into a `submissions` row, then mark the
  // assessment finalized and link it. Reuses the existing submissions pipeline,
  // so finalized group assessments show up in Admin → Submissions like any other.
  async finalize() {
    const a = get().assessment;
    if (!a) return { error: 'No active assessment.' };
    if (a.status !== 'draft') return { error: 'This assessment is already finalized.' };
    set({ saving: true, error: null });

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) { set({ saving: false }); return { error: 'Your session has expired — sign in again.' }; }

    const answers = get().answers;
    const s = computeScores(answers);
    const submission = {
      analyst_id: user.id,
      analyst_email: user.email,
      bank_name: a.bank_name,
      respondent_name: a.title || 'Group assessment',
      respondent_role: 'Group assessment (multi-department)',
      assessment_date: new Date().toISOString().slice(0, 10),
      global_score: s.globalScore,
      maturity_level: s.maturityLevel,
      bct_rate: s.bctRate,
      target_level: a.target_level,
      dimension_scores: s.dimensionScores,
      answers,
      profile: { bankName: a.bank_name, group: true, assessmentId: a.id, title: a.title || null },
    };
    const { data: sub, error: subErr } = await supabase
      .from('submissions').insert(submission).select('id').single();
    if (subErr) { set({ saving: false }); return { error: subErr.message }; }

    const { data: updated, error: updErr } = await supabase
      .from('assessments')
      .update({ status: 'finalized', finalized_at: new Date().toISOString(), submission_id: sub.id })
      .eq('id', a.id)
      .select('*')
      .single();
    set({ saving: false });
    if (updErr) return { error: updErr.message };
    set({ assessment: updated });
    return { data: { submissionId: sub.id } };
  },
}));

export default useAssessmentStore;
