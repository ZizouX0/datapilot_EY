import { create } from 'zustand';
import { INDICATORS, DIMENSIONS } from '../data/indicators';

const MATURITY_LEVELS = [
  { level: 1, cmmi: 'Initial', gartner: 'Unaware', color: '#B71C1C', bg: '#FDECEA', min: 1.00, max: 1.79 },
  { level: 2, cmmi: 'Emerging', gartner: 'Aware', color: '#E65100', bg: '#FFF3E0', min: 1.80, max: 2.59 },
  { level: 3, cmmi: 'Defined', gartner: 'Active', color: '#827717', bg: '#FFFDE7', min: 2.60, max: 3.39 },
  { level: 4, cmmi: 'Managed', gartner: 'Effective', color: '#1B5E20', bg: '#E8F5E9', min: 3.40, max: 4.19 },
  { level: 5, cmmi: 'Optimized', gartner: 'Transformative', color: '#0D47A1', bg: '#E3F2FD', min: 4.20, max: 5.00 },
];

const useAppStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────
  profile: { bankName: '', date: '', respondentName: '', role: '' },
  answers: {},
  targetLevel: 3,
  activeDimension: 'D1',
  activeSubDim: '1.1',

  // ── Computed / Selectors ───────────────────────────────────────────

  getEffectiveScore(indicatorId) {
    const { answers } = get();
    const ans = answers[indicatorId];
    if (!ans || ans.skipped) return null;
    if (ans.score === null || ans.score === undefined) return null;
    if (ans.score >= 3 && (!ans.evidence || ans.evidence.trim() === '')) return 2;
    return ans.score;
  },

  getSubDimScore(subDim) {
    const indicators = INDICATORS.filter(i => i.sub === subDim);
    const scores = indicators
      .map(i => get().getEffectiveScore(i.id))
      .filter(s => s !== null);
    if (scores.length === 0) return null;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  },

  getDimScore(dim) {
    const subDims = DIMENSIONS[dim].subDims;
    const scores = subDims
      .map(sd => get().getSubDimScore(sd))
      .filter(s => s !== null);
    if (scores.length === 0) return null;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  },

  getGlobalScore() {
    const dims = Object.keys(DIMENSIONS);
    const scores = dims.map(d => ({ weight: DIMENSIONS[d].weight, score: get().getDimScore(d) }));
    const answered = scores.filter(s => s.score !== null);
    if (answered.length === 0) return null;
    const totalWeight = answered.reduce((a, s) => a + s.weight, 0);
    const weighted = answered.reduce((a, s) => a + s.score * (s.weight / totalWeight), 0);
    return parseFloat(weighted.toFixed(2));
  },

  getMaturityLevel(score) {
    if (score === null || score === undefined) return MATURITY_LEVELS[0];
    return MATURITY_LEVELS.find(l => score >= l.min && score <= l.max) || MATURITY_LEVELS[4];
  },

  getPercentage(score) {
    if (score === null) return 0;
    return Math.round(score * 20);
  },

  getBCTIndicators() {
    return INDICATORS.filter(i => i.bct === true);
  },

  getBCTCompliance() {
    const bctInds = get().getBCTIndicators();
    let compliant = 0, nonCompliant = 0, pending = 0;
    bctInds.forEach(ind => {
      const score = get().getEffectiveScore(ind.id);
      if (score === null) pending++;
      else if (score >= 3) compliant++;
      else nonCompliant++;
    });
    const total = bctInds.length;
    const rate = total > 0 ? Math.round((compliant / total) * 100) : 0;
    const exposure = rate >= 80 ? 'Low' : rate >= 50 ? 'Medium' : 'High';
    return { compliant, nonCompliant, pending, total, rate, exposure };
  },

  getSkipCount(dim) {
    const { answers } = get();
    return INDICATORS.filter(i => i.dim === dim && answers[i.id]?.skipped).length;
  },

  getSkipLimit(dim) {
    return Math.floor(INDICATORS.filter(i => i.dim === dim).length * 0.20);
  },

  isEvidenceCapped(indicatorId) {
    const { answers } = get();
    const ans = answers[indicatorId];
    if (!ans || ans.skipped) return false;
    if (ans.score === null || ans.score === undefined) return false;
    return ans.score >= 3 && (!ans.evidence || ans.evidence.trim() === '');
  },

  getCappedCount() {
    return INDICATORS.filter(i => get().isEvidenceCapped(i.id)).length;
  },

  getAnsweredCount() {
    const { answers } = get();
    return INDICATORS.filter(i => {
      const ans = answers[i.id];
      return ans && (ans.skipped || ans.score !== null);
    }).length;
  },

  getTotalSkipCount() {
    const { answers } = get();
    return INDICATORS.filter(i => answers[i.id]?.skipped).length;
  },

  isDimensionComplete(dim) {
    return INDICATORS.filter(i => i.dim === dim).every(i => {
      const ans = get().answers[i.id];
      if (!ans) return false;
      if (ans.skipped) return true;
      return ans.score !== null && ans.score !== undefined;
    });
  },

  isAssessmentComplete() {
    return Object.keys(DIMENSIONS).every(d => get().isDimensionComplete(d));
  },

  getDimStatus(dim) {
    const inds = INDICATORS.filter(i => i.dim === dim);
    const answered = inds.filter(i => {
      const ans = get().answers[i.id];
      return ans && (ans.skipped || ans.score !== null);
    });
    if (answered.length === 0) return 'idle';
    if (answered.length === inds.length) return 'complete';
    return 'inprogress';
  },

  getCriticalGapsCount() {
    return Object.keys(DIMENSIONS).filter(d => {
      const score = get().getDimScore(d);
      return score !== null && score < 2.0;
    }).length;
  },

  hasCappedIndicators(dim) {
    return INDICATORS.filter(i => i.dim === dim).some(i => get().isEvidenceCapped(i.id));
  },

  getFormulaString() {
    const dims = Object.keys(DIMENSIONS);
    const scores = dims.map(d => ({ dim: d, score: get().getDimScore(d), weight: DIMENSIONS[d].weight }));
    const answered = scores.filter(s => s.score !== null);
    const totalWeight = answered.reduce((a, s) => a + s.weight, 0);
    return answered
      .map(s => {
        const capped = get().hasCappedIndicators(s.dim);
        return `${s.dim}(${s.score?.toFixed(2)}${capped ? ' cap' : ''})×${((s.weight / totalWeight) * 100).toFixed(0)}%`;
      })
      .join(' + ');
  },

  // ── Actions ────────────────────────────────────────────────────────

  setProfile(profile) {
    set({ profile });
  },

  setAnswer(indicatorId, score) {
    set(state => ({
      answers: {
        ...state.answers,
        [indicatorId]: {
          ...state.answers[indicatorId],
          score,
          skipped: false,
        },
      },
    }));
  },

  setEvidence(indicatorId, evidence) {
    set(state => ({
      answers: {
        ...state.answers,
        [indicatorId]: {
          ...state.answers[indicatorId],
          evidence,
        },
      },
    }));
  },

  skipIndicator(indicatorId) {
    const ind = INDICATORS.find(i => i.id === indicatorId);
    if (!ind) return;
    // BCT indicators cannot be skipped
    if (ind.bct) return;
    // Check 20% limit
    const currentSkips = get().getSkipCount(ind.dim);
    const limit = get().getSkipLimit(ind.dim);
    if (currentSkips >= limit) return;
    set(state => ({
      answers: {
        ...state.answers,
        [indicatorId]: {
          ...state.answers[indicatorId],
          skipped: true,
          score: null,
        },
      },
    }));
  },

  unskipIndicator(indicatorId) {
    set(state => ({
      answers: {
        ...state.answers,
        [indicatorId]: {
          ...state.answers[indicatorId],
          skipped: false,
        },
      },
    }));
  },

  setTargetLevel(level) {
    set({ targetLevel: level });
  },

  setActiveDimension(dim) {
    set({ activeDimension: dim, activeSubDim: DIMENSIONS[dim].subDims[0] });
  },

  setActiveSubDim(sub) {
    set({ activeSubDim: sub });
  },

  resetAll() {
    set({
      profile: { bankName: '', date: '', respondentName: '', role: '' },
      answers: {},
      targetLevel: 3,
      activeDimension: 'D1',
      activeSubDim: '1.1',
    });
  },
}));

export { MATURITY_LEVELS };
export default useAppStore;
