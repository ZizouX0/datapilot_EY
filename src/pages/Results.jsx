import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import useAppStore, { MATURITY_LEVELS } from '../store/useAppStore';
import useSubmissionsStore from '../store/useSubmissionsStore';
import useSettingsStore from '../store/useSettingsStore';
import useContentStore from '../store/useContentStore';
import { isSupabaseConfigured } from '../lib/supabase';
import { DIMENSIONS, INDICATORS } from '../data/indicators';
import RadarChart from '../charts/RadarChart';
import DimensionBars from '../charts/DimensionBars';
import MaturityBadge from '../components/ui/MaturityBadge';
import ScoreBadge from '../components/ui/ScoreBadge';
import ReportCover from '../components/ReportCover';
import RoadmapSection from '../components/report/RoadmapSection';

const INTERP = [
  { range: '1.0–1.79', action: 'Assign data owners and document all processes' },
  { range: '1.80–2.59', action: 'Formalize practices and reduce key-person dependency' },
  { range: '2.60–3.39', action: 'Scale standardized practices and align with BCT' },
  { range: '3.40–4.19', action: 'Optimize with continuous improvement and automated reporting' },
  { range: '4.20–5.0', action: 'Benchmark externally and drive sector-level data innovation' },
];

const COPY = {
  en: {
    reportTitle: 'Data Maturity Assessment',
    reportSubtitle: 'Global maturity & dimension scoring',
    documentTitle: (bank) => `DataPilot - ${bank || 'Bank'} - Maturity Report`,
    submitting: 'Submitting…',
    submitForReview: '↑ Submit for review',
    saveAsPdf: '⤓ Save as PDF',
    submittedOk: 'Assessment submitted for review.',
    pdfHint: 'Opens your browser\'s save window — choose "Save as PDF" to download the file.',
    executiveSummary: 'Executive Summary',
    theBank: 'The bank',
    summaryScores: (bank, pct, score) => (<><strong>{bank}</strong> scores <strong>{pct}%</strong>{' '}({score} / 5), placing it at maturity{' '}</>),
    summaryLevel: (level, cmmi, gartner) => (<><strong>Level {level} — {cmmi}</strong> ({gartner}).</>),
    summaryStrength: (name, score) => (<> Its strongest area is <strong>{name}</strong> ({score}/5).</>),
    summaryPriority: (name, score) => (<> The largest gap is <strong>{name}</strong> ({score}/5),
      which should be prioritised.</>),
    summaryBct: (exposure, compliant, total) => (<>{' '}BCT regulatory exposure is <strong>{exposure}</strong>, with {compliant} of{' '}
      {total} mandatory indicators compliant.</>),
    topStrengths: 'Top Strengths',
    priorityFocus: 'Priority Focus Areas',
    globalMaturityIndex: 'Global Maturity Index',
    noIndicators: 'No indicators answered yet',
    dimensionRadar: 'Dimension Radar',
    dimensionScores: 'Dimension Scores',
    formulaPlaceholder: 'Formula will appear once indicators are answered',
    setTarget: 'Set target maturity level',
    indicatorsScored: 'Indicators scored',
    coverage: (n) => `${n}% coverage`,
    indicatorsSkipped: 'Indicators skipped',
    excludedFromScoring: 'Excluded from scoring',
    bctCompliant: 'BCT compliant',
    regulatoryExposure: (e) => `Regulatory exposure: ${e}`,
    criticalGaps: 'Critical gaps',
    dimensionsBelow: 'Dimensions below 2.0/5',
    scoreInterpretation: 'Score Interpretation Grid',
    bctComplianceStatus: 'BCT Regulatory Compliance Status',
    bctComplianceLine: (compliant, total) => `${compliant} of ${total} BCT indicators compliant.`,
    regulatoryExposureLabel: (e) => `Regulatory exposure: ${e}`,
    thIndicator: 'Indicator',
    thScore: 'Score',
    thStatus: 'Status',
    thEvidence: 'Evidence',
    pending: 'Pending',
    compliant: 'Compliant',
    nonCompliant: 'Non-compliant',
    noEvidence: 'No evidence provided',
    improvementRoadmap: 'Improvement Roadmap',
    methodologyReferences: 'Methodology & References',
    methodScale: (n) => `Maturity is scored 1–5 on a CMMI-aligned scale; the global index is a weighted average of the ${n} dimensions.`,
    methodEvidence: 'A score of 3 or above requires documented evidence; without it the score is capped at 2/5.',
    methodSkip: 'Up to 20% of indicators per dimension may be skipped; BCT-flagged indicators are mandatory and cannot be skipped.',
    methodProxy: (names, isPlural) => `${names} ${isPlural ? 'are' : 'is'} assessed through objective proxy signals rather than direct self-declaration.`,
    methodRefs: 'Regulatory references: BCT Circulaire N°2025-08 and BCBS 239 (risk data aggregation & reporting).',
    proxySuffix: 'proxy',
  },
  fr: {
    reportTitle: 'Évaluation de la maturité des données',
    reportSubtitle: 'Score de maturité global et par dimension',
    documentTitle: (bank) => `DataPilot - ${bank || 'Banque'} - Rapport de maturité`,
    submitting: 'Envoi…',
    submitForReview: '↑ Soumettre pour revue',
    saveAsPdf: '⤓ Enregistrer en PDF',
    submittedOk: 'Évaluation soumise pour revue.',
    pdfHint: 'Ouvre la fenêtre d\'enregistrement de votre navigateur — choisissez « Enregistrer au format PDF » pour télécharger le fichier.',
    executiveSummary: 'Synthèse exécutive',
    theBank: 'La banque',
    summaryScores: (bank, pct, score) => (<><strong>{bank}</strong> obtient <strong>{pct}%</strong>{' '}({score} / 5), ce qui la situe au niveau de maturité{' '}</>),
    summaryLevel: (level, cmmi, gartner) => (<><strong>Niveau {level} — {cmmi}</strong> ({gartner}).</>),
    summaryStrength: (name, score) => (<> Son point fort est <strong>{name}</strong> ({score}/5).</>),
    summaryPriority: (name, score) => (<> Le plus grand écart concerne <strong>{name}</strong> ({score}/5),
      à traiter en priorité.</>),
    summaryBct: (exposure, compliant, total) => (<>{' '}L'exposition réglementaire BCT est <strong>{exposure}</strong>, avec {compliant} indicateurs obligatoires conformes sur{' '}
      {total}.</>),
    topStrengths: 'Principaux points forts',
    priorityFocus: 'Axes prioritaires',
    globalMaturityIndex: 'Indice de maturité global',
    noIndicators: 'Aucun indicateur renseigné pour l\'instant',
    dimensionRadar: 'Radar des dimensions',
    dimensionScores: 'Scores par dimension',
    formulaPlaceholder: 'La formule apparaîtra une fois les indicateurs renseignés',
    setTarget: 'Définir le niveau de maturité cible',
    indicatorsScored: 'Indicateurs notés',
    coverage: (n) => `${n}% de couverture`,
    indicatorsSkipped: 'Indicateurs ignorés',
    excludedFromScoring: 'Exclus du calcul',
    bctCompliant: 'Conformes BCT',
    regulatoryExposure: (e) => `Exposition réglementaire : ${e}`,
    criticalGaps: 'Écarts critiques',
    dimensionsBelow: 'Dimensions sous 2,0/5',
    scoreInterpretation: 'Grille d\'interprétation des scores',
    bctComplianceStatus: 'Statut de conformité réglementaire BCT',
    bctComplianceLine: (compliant, total) => `${compliant} indicateurs BCT conformes sur ${total}.`,
    regulatoryExposureLabel: (e) => `Exposition réglementaire : ${e}`,
    thIndicator: 'Indicateur',
    thScore: 'Score',
    thStatus: 'Statut',
    thEvidence: 'Preuve',
    pending: 'En attente',
    compliant: 'Conforme',
    nonCompliant: 'Non conforme',
    noEvidence: 'Aucune preuve fournie',
    improvementRoadmap: 'Feuille de route d\'amélioration',
    methodologyReferences: 'Méthodologie et références',
    methodScale: (n) => `La maturité est notée de 1 à 5 sur une échelle alignée CMMI ; l'indice global est une moyenne pondérée des ${n} dimensions.`,
    methodEvidence: 'Un score de 3 ou plus exige une preuve documentée ; sans elle, le score est plafonné à 2/5.',
    methodSkip: 'Jusqu\'à 20 % des indicateurs par dimension peuvent être ignorés ; les indicateurs marqués BCT sont obligatoires et ne peuvent être ignorés.',
    methodProxy: (names, isPlural) => `${names} ${isPlural ? 'sont évaluées' : 'est évaluée'} via des signaux proxy objectifs plutôt que par auto-déclaration directe.`,
    methodRefs: 'Références réglementaires : BCT Circulaire N°2025-08 et BCBS 239 (agrégation et reporting des données de risque).',
    proxySuffix: 'proxy',
  },
};

export default function Results() {
  const printRef = useRef();
  const globalScore = useAppStore(s => s.getGlobalScore());
  const getMaturityLevel = useAppStore(s => s.getMaturityLevel);
  const getPercentage = useAppStore(s => s.getPercentage);
  const getDimScore = useAppStore(s => s.getDimScore);
  const targetLevel = useAppStore(s => s.targetLevel);
  const setTargetLevel = useAppStore(s => s.setTargetLevel);
  const getBCTCompliance = useAppStore(s => s.getBCTCompliance);
  const getBCTIndicators = useAppStore(s => s.getBCTIndicators);
  const getEffectiveScore = useAppStore(s => s.getEffectiveScore);
  const getScoredCount = useAppStore(s => s.getScoredCount);
  const getTotalSkipCount = useAppStore(s => s.getTotalSkipCount);
  const getCriticalGapsCount = useAppStore(s => s.getCriticalGapsCount);
  const getFormulaString = useAppStore(s => s.getFormulaString);
  const answers = useAppStore(s => s.answers);
  const profile = useAppStore(s => s.profile);
  const buildSubmission = useAppStore(s => s.buildSubmission);

  const saveSubmission = useSubmissionsStore(s => s.saveSubmission);
  const saving = useSubmissionsStore(s => s.saving);
  const [submitMsg, setSubmitMsg] = useState(null); // { ok, text }

  const lang = useSettingsStore(s => s.language);
  useContentStore(s => s.version); // re-render when the questionnaire is re-hydrated
  const c = COPY[lang] || COPY.en;

  async function handleSubmit() {
    setSubmitMsg(null);
    const { error: err } = await saveSubmission(buildSubmission());
    if (err) setSubmitMsg({ ok: false, text: err });
    else setSubmitMsg({ ok: true, text: c.submittedOk });
  }

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: c.documentTitle(profile.bankName),
  });

  const lvl = getMaturityLevel(globalScore);
  const pct = getPercentage(globalScore);
  const bctData = getBCTCompliance();
  const bctInds = getBCTIndicators();

  const radarData = Object.entries(DIMENSIONS).map(([key, d]) => ({
    name: key === 'D5' ? `${d.name} (${c.proxySuffix})` : d.name,
    current: getDimScore(key) ?? 0,
    target: targetLevel,
  }));

  // Rank scored dimensions to drive the executive summary + strengths/priorities.
  const rankedDims = Object.entries(DIMENSIONS)
    .map(([key, d]) => ({ key, name: d.name, color: d.color, score: getDimScore(key) }))
    .filter(d => d.score !== null)
    .sort((a, b) => b.score - a.score);
  const strengths = rankedDims.slice(0, 2);
  const priorities = [...rankedDims].reverse().slice(0, 2);
  const dimensionCount = Object.keys(DIMENSIONS).length;
  const proxyDimNames = Object.values(DIMENSIONS).filter(d => d.proxy).map(d => d.name);

  return (
    <div ref={printRef}>
      <ReportCover
        title={c.reportTitle}
        subtitle={c.reportSubtitle}
        profile={profile}
      />
      <div className="print-content">
      {/* Export + submit-for-review actions */}
      <div className="flex flex-col items-end gap-1 mb-4 no-print">
        <div className="flex items-center gap-2">
          {isSupabaseConfigured && (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-ey-charcoal text-white font-semibold rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? c.submitting : c.submitForReview}
            </button>
          )}
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-ey-yellow text-ey-charcoal font-semibold rounded-lg text-sm hover:bg-yellow-400"
          >
            {c.saveAsPdf}
          </button>
        </div>
        <span className="text-[11px] text-gray-400">
          {c.pdfHint}
        </span>
        {submitMsg && (
          <span className={`text-[12px] rounded-lg px-3 py-1.5 border ${
            submitMsg.ok
              ? 'text-green-700 bg-green-50 border-green-200'
              : 'text-red-600 bg-red-50 border-red-200'
          }`}>
            {submitMsg.text}
          </span>
        )}
      </div>

      {/* Executive summary — auto-written verdict for a non-technical reader */}
      {Number.isFinite(globalScore) && (
        <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-ey-purple p-5 mb-6">
          <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-2">
            {c.executiveSummary}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {c.summaryScores(profile.bankName || c.theBank, pct, globalScore.toFixed(2))}
            {c.summaryLevel(lvl.level, lvl.cmmi, lvl.gartner)}
            {strengths[0] && c.summaryStrength(strengths[0].name, strengths[0].score.toFixed(2))}
            {priorities[0] && c.summaryPriority(priorities[0].name, priorities[0].score.toFixed(2))}
            {c.summaryBct(bctData.exposure, bctData.compliant, bctData.total)}
          </p>
        </div>
      )}

      {/* Strengths & priority focus areas */}
      {rankedDims.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { title: c.topStrengths, items: strengths, accent: '#1B5E20', label: 'strongest' },
            { title: c.priorityFocus, items: priorities, accent: '#B71C1C', label: 'biggest gaps' },
          ].map(col => (
            <div key={col.title} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-[9px] font-bold tracking-widest uppercase mb-3" style={{ color: col.accent }}>
                {col.title}
              </div>
              <div className="flex flex-col gap-3">
                {col.items.map(d => (
                  <div key={d.key} className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-sm text-gray-700 flex-1">{d.name}</span>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(d.score / 5) * 100}%`, background: d.color }} />
                    </div>
                    <span className="text-sm font-bold tabular-nums w-10 text-right" style={{ color: d.color }}>
                      {d.score.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top 3 cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Card 1: Global score */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-3">
            {c.globalMaturityIndex}
          </div>
          {Number.isFinite(globalScore) ? (
            <>
              <div className="text-5xl font-bold tabular-nums" style={{ color: lvl.color }}>
                {pct}%
              </div>
              <div className="text-sm text-gray-500 mt-1">{globalScore.toFixed(2)} / 5</div>
              <div className="mt-3">
                <MaturityBadge score={globalScore} />
              </div>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: lvl.color }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-2">BCT Circulaire N°2025-08</div>
            </>
          ) : (
            <div className="text-gray-400 text-sm">{c.noIndicators}</div>
          )}
        </div>

        {/* Card 2: Radar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-2">
            {c.dimensionRadar}
          </div>
          <RadarChart data={radarData} />
        </div>

        {/* Card 3: Dimension bars */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-3">
            {c.dimensionScores}
          </div>
          <DimensionBars showGap targetLevel={targetLevel} expandable />
          <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] font-mono text-gray-400 leading-relaxed">
            {getFormulaString() || c.formulaPlaceholder}
          </div>
        </div>
      </div>

      {/* Target level selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="text-xs font-semibold text-gray-600 mb-3">{c.setTarget}</div>
        <div className="flex gap-2">
          {MATURITY_LEVELS.map(l => (
            <button
              key={l.level}
              onClick={() => setTargetLevel(l.level)}
              className={`flex-1 py-2 px-3 rounded-lg border-2 text-xs font-semibold transition-all ${
                targetLevel === l.level
                  ? 'border-ey-yellow bg-ey-yellow text-ey-charcoal'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="font-bold">{l.level}</div>
              <div className="font-normal text-[10px] mt-0.5">{l.cmmi}</div>
            </button>
          ))}
        </div>
      </div>

      {/* KPI mini cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          {
            num: `${getScoredCount()} / ${INDICATORS.length}`,
            label: c.indicatorsScored,
            sub: c.coverage(INDICATORS.length ? Math.round((getScoredCount() / INDICATORS.length) * 100) : 0),
            color: '#3D108A',
          },
          {
            num: `${getTotalSkipCount()} / ${INDICATORS.length}`,
            label: c.indicatorsSkipped,
            sub: c.excludedFromScoring,
            color: '#188CE5',
          },
          {
            num: `${bctData.compliant} / ${bctData.total}`,
            label: c.bctCompliant,
            sub: c.regulatoryExposure(bctData.exposure),
            color: bctData.rate >= 80 ? '#1B5E20' : bctData.rate >= 50 ? '#E65100' : '#B71C1C',
          },
          {
            num: getCriticalGapsCount(),
            label: c.criticalGaps,
            sub: c.dimensionsBelow,
            color: '#B71C1C',
          },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold tabular-nums" style={{ color: kpi.color }}>
              {kpi.num}
            </div>
            <div className="text-xs font-semibold text-gray-700 mt-1">{kpi.label}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Maturity interpretation grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-3">
          {c.scoreInterpretation}
        </div>
        <div className="grid grid-cols-5 gap-3">
          {MATURITY_LEVELS.map((l, i) => {
            const isCurrent = lvl.level === l.level;
            return (
              <div
                key={l.level}
                className={`rounded-xl p-4 border-2 relative overflow-hidden ${
                  isCurrent ? 'border-ey-yellow bg-yellow-50' : 'border-gray-100'
                }`}
                style={{ borderTopColor: l.color, borderTopWidth: 3 }}
              >
                {isCurrent && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-ey-yellow rounded-full flex items-center justify-center text-ey-charcoal text-xs font-bold">
                    ✓
                  </div>
                )}
                <div className="text-[10px] text-gray-400 tabular-nums mb-1">{INTERP[i].range}</div>
                <div className="text-base font-bold" style={{ color: l.color }}>{l.cmmi}</div>
                <div className="text-[10px] italic text-gray-500 mb-2">{l.gartner}</div>
                <div className="text-[10px] text-gray-600 leading-snug">{INTERP[i].action}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BCT compliance panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-1">
          {c.bctComplianceStatus}
        </div>
        <p className="text-sm text-gray-700 mb-3">
          {c.bctComplianceLine(bctData.compliant, bctData.total)}{' '}
          <span className={`font-semibold ${
            bctData.exposure === 'Low' ? 'text-green-700' :
            bctData.exposure === 'Medium' ? 'text-orange-600' : 'text-red-700'
          }`}>
            {c.regulatoryExposureLabel(bctData.exposure)}
          </span>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] uppercase tracking-wide">
                <th className="text-left py-2.5 px-3 font-semibold">{c.thIndicator}</th>
                <th className="text-left py-2.5 px-3 font-semibold">{c.thScore}</th>
                <th className="text-left py-2.5 px-3 font-semibold">{c.thStatus}</th>
                <th className="text-left py-2.5 px-3 font-semibold">{c.thEvidence}</th>
              </tr>
            </thead>
            <tbody>
              {bctInds.map(ind => {
                const eff = getEffectiveScore(ind.id);
                const ans = answers[ind.id] || {};
                const compliant = eff !== null && eff >= 3;
                const pending = eff === null;
                return (
                  <tr
                    key={ind.id}
                    className={`border-b border-gray-50 ${!compliant && !pending ? 'bg-red-50' : ''}`}
                  >
                    <td className="py-2 pr-4 text-gray-700 leading-snug">
                      <span className="font-mono text-gray-400 mr-1">{ind.id}</span>
                      {ind.q.length > 55 ? ind.q.slice(0, 55) + '…' : ind.q}
                    </td>
                    <td className="py-2 pr-4">
                      <ScoreBadge score={eff} />
                    </td>
                    <td className="py-2 pr-4">
                      {pending ? (
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-semibold">{c.pending}</span>
                      ) : compliant ? (
                        <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-semibold">{c.compliant}</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-semibold">{c.nonCompliant}</span>
                      )}
                    </td>
                    <td className="py-2 text-gray-500 italic">
                      {ans.evidence ? ans.evidence.slice(0, 60) : c.noEvidence}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Improvement roadmap — appended so one PDF covers diagnosis + plan */}
      <div className="mt-6">
        <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-3">
          {c.improvementRoadmap}
        </div>
        <RoadmapSection />
      </div>

      {/* Methodology & references appendix */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mt-6 text-xs text-gray-600 leading-relaxed">
        <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-3">
          {c.methodologyReferences}
        </div>
        <ul className="flex flex-col gap-1.5 list-disc pl-4">
          <li>{c.methodScale(dimensionCount)}</li>
          <li>{c.methodEvidence}</li>
          <li>{c.methodSkip}</li>
          {proxyDimNames.length > 0 && (
            <li>{c.methodProxy(proxyDimNames.join(', '), proxyDimNames.length > 1)}</li>
          )}
          <li>{c.methodRefs}</li>
        </ul>
      </div>
      </div>
    </div>
  );
}
