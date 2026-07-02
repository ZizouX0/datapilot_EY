// Roadmap builder — turns the assessment into prioritized, phase-bucketed
// action items. Pure functions so the logic stays testable and decoupled
// from the React layer.

import { DIMENSIONS, SUBDIM_NAMES, INDICATORS } from '../data/indicators';
import { RECOMMENDATIONS, getBand } from '../data/recommendations';

// BCT-mandatory indicators are compliant at score >= 3. Anything below is a
// regulatory gap and must surface in Phase 1 regardless of the sub-dim average.
const BCT_COMPLIANCE_THRESHOLD = 3;

// Visual styling per phase (language-independent). The display text lives in
// PHASE_I18N so the roadmap reads in the user's language; `label` is kept here
// only as a stable React key / fallback.
export const PHASE_META = [
  { label: 'Phase 1', headerClass: 'bg-ey-charcoal text-white', accent: '#B71C1C' },
  { label: 'Phase 2', headerClass: 'bg-ey-yellow text-ey-charcoal', accent: '#E65100' },
  { label: 'Phase 3', headerClass: 'bg-teal-600 text-white', accent: '#188CE5' },
];

// Translated display text for the three phases (label · sub-horizon · description).
export const PHASE_I18N = {
  en: [
    { label: 'Phase 1', sub: '0–3 months', desc: 'Critical & regulatory remediation' },
    { label: 'Phase 2', sub: '3–6 months', desc: 'Formalization & documentation' },
    { label: 'Phase 3', sub: '6–12 months', desc: 'Optimization & continuous improvement' },
  ],
  fr: [
    { label: 'Phase 1', sub: '0–3 mois', desc: 'Remédiation critique et réglementaire' },
    { label: 'Phase 2', sub: '3–6 mois', desc: 'Formalisation et documentation' },
    { label: 'Phase 3', sub: '6–12 mois', desc: 'Optimisation et amélioration continue' },
  ],
};

// Translated labels for the stable priority/effort keys the builder emits.
export const PRIORITY_I18N = {
  en: { critical: 'Critical', high: 'High', moderate: 'Moderate', low: 'Low' },
  fr: { critical: 'Critique', high: 'Élevée', moderate: 'Modérée', low: 'Faible' },
};
export const EFFORT_I18N = {
  en: { High: 'High', Medium: 'Medium', Low: 'Low' },
  fr: { High: 'Élevé', Medium: 'Moyen', Low: 'Faible' },
};

export const phaseText = (lang) => PHASE_I18N[lang] || PHASE_I18N.en;
export const priorityText = (key, lang) => (PRIORITY_I18N[lang] || PRIORITY_I18N.en)[key] || key;
export const effortText = (level, lang) => (EFFORT_I18N[lang] || EFFORT_I18N.en)[level] || level;

// Pull the leading regulatory reference out of an indicator hint, if present.
// Handles both "BCT Art. X.Y — …" and "BCBS 239 Principle n — …" hints so a
// BCBS-based BCT indicator isn't mislabelled as a bare 'BCT' item.
export function extractBctRef(hint) {
  if (!hint) return null;
  const bcbs = hint.match(/^\s*BCBS\s*239(?:\s*Principle\s*(\d+))?/i);
  if (bcbs) return bcbs[1] ? `BCBS 239 P${bcbs[1]}` : 'BCBS 239';
  const m = hint.match(/^\s*(BCT[^—–-]+)/);
  return m ? m[1].trim() : 'BCT';
}

// Effort heuristic: bigger gaps in heavier dimensions cost more to close.
function estimateEffort(gap, weight) {
  if (gap >= 2 || (gap >= 1.5 && weight >= 0.2)) return 'High';
  if (gap >= 1) return 'Medium';
  return 'Low';
}

function priorityFor(current, hasBctGap) {
  // `key` is the stable, language-independent priority used for translation;
  // `label` is the English fallback. Render via priorityText(key, lang).
  if (hasBctGap) return { key: 'critical', label: 'Critical', bg: '#FDECEA', color: '#B71C1C' };
  if (current < 2.0) return { key: 'critical', label: 'Critical', bg: '#FDECEA', color: '#B71C1C' };
  if (current < 2.6) return { key: 'high', label: 'High', bg: '#FFF3E0', color: '#E65100' };
  if (current < 3.4) return { key: 'moderate', label: 'Moderate', bg: '#FFFDE7', color: '#827717' };
  return { key: 'low', label: 'Low', bg: '#E8F5E9', color: '#1B5E20' };
}

// Decide which phase a sub-dimension belongs to. Regulatory gaps always lead.
function phaseFor(current, hasBctGap) {
  if (hasBctGap || current < 2.0) return 0;
  if (current < 3.0) return 1;
  return 2;
}

/**
 * Build the roadmap from accessor functions.
 * @param {object} sel - { getSubDimScore, getEffectiveScore, targetLevel }
 * @returns {{ phases: Array<Array<item>>, summary: object }}
 */
export function buildRoadmap({ getSubDimScore, getEffectiveScore, targetLevel }) {
  const target = targetLevel ?? 3;
  const phases = [[], [], []];

  Object.keys(DIMENSIONS).forEach(dim => {
    const meta = DIMENSIONS[dim];
    meta.subDims.forEach(sd => {
      const current = getSubDimScore(sd);
      if (current === null || current === undefined) return; // not assessed
      const gap = +(target - current).toFixed(2);
      if (gap <= 0) return; // already meets or exceeds target — no action needed

      // Failing BCT indicators inside this sub-dimension.
      const bctGaps = INDICATORS.filter(
        i =>
          i.sub === sd &&
          i.bct &&
          getEffectiveScore(i.id) !== null &&
          getEffectiveScore(i.id) < BCT_COMPLIANCE_THRESHOLD
      ).map(i => ({ id: i.id, ref: extractBctRef(i.hint), q: i.q }));

      const hasBctGap = bctGaps.length > 0;
      const phaseIdx = phaseFor(current, hasBctGap);

      // Distribute the dimension's recommendations across its sub-dims so two
      // sub-dims of the same dimension don't render identical advice.
      const band = getBand(current);
      // Custom/renamed dimensions (e.g. an admin-added D6) have no canned
      // recommendations — fall back to an empty list instead of crashing.
      const recs = (RECOMMENDATIONS[dim] || {})[band] || [];
      const order = meta.subDims.indexOf(sd);
      const actions = recs.length
        ? [recs[order % recs.length], recs[(order + 1) % recs.length]].filter(
            (a, i, arr) => arr.indexOf(a) === i
          )
        : [];

      // Impact ranking: weight × gap, with a large boost so regulatory gaps lead.
      const impact = meta.weight * gap + (hasBctGap ? 10 : 0);

      phases[phaseIdx].push({
        dim,
        dimName: meta.name,
        color: meta.color,
        weight: meta.weight,
        sd,
        sdName: SUBDIM_NAMES[sd],
        current,
        target,
        gap,
        hasBctGap,
        bctGaps,
        priority: priorityFor(current, hasBctGap),
        effort: estimateEffort(gap, meta.weight),
        actions,
        impact,
      });
    });
  });

  phases.forEach(items => items.sort((a, b) => b.impact - a.impact));

  const allItems = phases.flat();
  const summary = {
    target,
    totalActions: allItems.length,
    criticalActions: phases[0].length,
    bctItems: allItems.reduce((n, it) => n + it.bctGaps.length, 0),
    phaseCounts: phases.map(p => p.length),
  };

  return { phases, summary };
}
