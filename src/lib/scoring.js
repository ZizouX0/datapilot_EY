// Pure scoring helpers for a completed assessment — shared by the group
// (Model B) finalize path. Mirrors the rules in useAppStore so a group
// assessment scores identically to a solo one:
//   • a skipped or unanswered indicator contributes nothing;
//   • a score ≥ 3 with no evidence is capped to 2;
//   • sub-dimension = mean of its indicators, dimension = mean of its
//     sub-dimensions, global = dimension scores weighted by DIMENSIONS[d].weight.
// `answers` is a map { indicatorId: { score, evidence, skipped } }.
import { INDICATORS, DIMENSIONS } from '../data/indicators';

export const MATURITY_LEVELS = [
  { level: 1, min: 1.0, max: 1.79 },
  { level: 2, min: 1.8, max: 2.59 },
  { level: 3, min: 2.6, max: 3.39 },
  { level: 4, min: 3.4, max: 4.19 },
  { level: 5, min: 4.2, max: 5.0 },
];

export function effectiveScore(ans) {
  if (!ans || ans.skipped) return null;
  if (ans.score === null || ans.score === undefined) return null;
  if (ans.score >= 3 && (!ans.evidence || String(ans.evidence).trim() === '')) return 2;
  return ans.score;
}

export function subDimScore(answers, sub) {
  const scores = INDICATORS.filter(i => i.sub === sub)
    .map(i => effectiveScore(answers[i.id]))
    .filter(s => s !== null);
  if (!scores.length) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function dimScore(answers, dim) {
  const subs = DIMENSIONS[dim]?.subDims || [];
  const scores = subs.map(sd => subDimScore(answers, sd)).filter(s => s !== null);
  if (!scores.length) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function globalScore(answers) {
  const arr = Object.keys(DIMENSIONS)
    .map(d => ({ weight: DIMENSIONS[d].weight, score: dimScore(answers, d) }))
    .filter(s => s.score !== null);
  if (!arr.length) return null;
  const totalWeight = arr.reduce((a, s) => a + s.weight, 0);
  // Degenerate weights (all zero — e.g. an admin blanked the weight column) fall
  // back to an unweighted mean, matching useAppStore.getGlobalScore exactly so
  // the solo and group paths never score the same answers differently.
  if (totalWeight <= 0) {
    const mean = arr.reduce((a, s) => a + s.score, 0) / arr.length;
    return parseFloat(mean.toFixed(2));
  }
  const weighted = arr.reduce((a, s) => a + s.score * (s.weight / totalWeight), 0);
  return parseFloat(weighted.toFixed(2));
}

export function maturityLevel(score) {
  if (score === null || score === undefined) return null;
  // Highest band whose min ≤ score (gap-free). The bands have gaps between each
  // max and the next min (1.79→1.8, …); a `min ≤ score ≤ max` test would match
  // NO band for an in-gap value like 1.795 and silently fall through. Selecting
  // the highest band whose min is reached — and defaulting to level 1, not 5 —
  // mirrors useAppStore.getMaturityLevel and never mislabels a low score as
  // Optimized. This value is persisted to submissions.maturity_level on finalize.
  const bands = MATURITY_LEVELS.filter(x => score >= x.min);
  return bands.length ? bands[bands.length - 1].level : 1;
}

export function bctRate(answers) {
  const bct = INDICATORS.filter(i => i.bct);
  // No BCT-flagged indicators → vacuously compliant (mirrors
  // useAppStore.getBCTCompliance; 0 would read as maximal non-compliance).
  if (!bct.length) return 100;
  const compliant = bct.filter(i => {
    const s = effectiveScore(answers[i.id]);
    return s !== null && s >= 3;
  }).length;
  return Math.round((compliant / bct.length) * 100);
}

// Headline scores for finalizing a group assessment into a `submissions` row.
export function computeScores(answers) {
  const dimensionScores = {};
  Object.keys(DIMENSIONS).forEach(d => { dimensionScores[d] = dimScore(answers, d); });
  const g = globalScore(answers);
  return {
    dimensionScores,
    globalScore: g,
    maturityLevel: maturityLevel(g),
    bctRate: bctRate(answers),
  };
}

// Convert assessment_answers rows into the answers map the helpers expect.
export function answersFromRows(rows) {
  const map = {};
  (rows || []).forEach(r => {
    map[r.indicator_id] = { score: r.score, evidence: r.evidence, skipped: !!r.skipped };
  });
  return map;
}
