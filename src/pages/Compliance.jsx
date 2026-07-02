import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import useAppStore from '../store/useAppStore';
import useSettingsStore from '../store/useSettingsStore';
import useContentStore from '../store/useContentStore';
import ScoreBadge from '../components/ui/ScoreBadge';
import DimensionPill from '../components/ui/DimensionPill';
import ReportCover from '../components/ReportCover';

const COPY = {
  en: {
    coverTitle: 'BCT Regulatory Compliance',
    coverSubtitle: 'Circulaire N°2025-08 & BCBS 239 alignment',
    title: 'BCT Regulatory Compliance',
    subtitle: 'BCT Circulaire N°2025-08 and BCBS 239 alignment status',
    kpiCompliantLabel: 'Compliant Indicators',
    kpiComplianceRate: (r) => `${r}% compliance rate`,
    kpiExposureLabel: 'Regulatory Exposure',
    kpiExposureSub: 'Based on compliance rate',
    kpiNonCompliantLabel: 'Non-Compliant',
    kpiNonCompliantSub: 'Indicators scoring below 3',
    kpiPendingLabel: 'Pending',
    kpiPendingSub: 'Not yet answered',
    exposureLow: 'Low',
    exposureMedium: 'Medium',
    exposureHigh: 'High',
    rulesNote: 'Compliant = effective score ≥ 3 / 5. Regulatory exposure: Low ≥ 80% compliant · Medium 50–79% · High below 50%.',
    actionRequired: (n) => `Action required — ${n} item${n > 1 ? 's' : ''} to address`,
    actionRequiredSub: 'Close these to raise BCT compliance and reduce regulatory exposure.',
    statusNonCompliant: (e) => `Non-compliant · ${e}/5`,
    toReachCompliance: 'To reach compliance:',
    pending: 'Pending',
    notYetAssessed: 'Not yet assessed — answer this indicator to determine compliance.',
    allCompliant: (n) => `✓ All ${n} mandatory BCT indicators are compliant. No outstanding actions.`,
    colIndicator: 'Indicator',
    colDimension: 'Dimension',
    colReference: 'Reference',
    colScore: 'Score',
    colStatus: 'Status',
    colEvidence: 'Evidence',
    compliant: 'Compliant',
    nonCompliant: 'Non-compliant',
    noEvidence: 'No evidence provided',
    summary: (compliant, total) => `${compliant} of ${total} BCT indicators compliant.`,
    summaryExposure: (e) => `Regulatory exposure: ${e}`,
    summaryRate: (r) => `${r}% of BCT indicators compliant`,
    savePdf: '⤓ Save as PDF',
    saveEvidence: 'Save BCT Evidence Package',
    saveHint: 'Opens your browser’s save window — choose "Save as PDF" to download the file.',
  },
  fr: {
    coverTitle: 'Conformité réglementaire BCT',
    coverSubtitle: 'Alignement Circulaire N°2025-08 & BCBS 239',
    title: 'Conformité réglementaire BCT',
    subtitle: 'État d’alignement Circulaire BCT N°2025-08 et BCBS 239',
    kpiCompliantLabel: 'Indicateurs conformes',
    kpiComplianceRate: (r) => `Taux de conformité de ${r} %`,
    kpiExposureLabel: 'Exposition réglementaire',
    kpiExposureSub: 'Selon le taux de conformité',
    kpiNonCompliantLabel: 'Non conformes',
    kpiNonCompliantSub: 'Indicateurs notés en dessous de 3',
    kpiPendingLabel: 'En attente',
    kpiPendingSub: 'Pas encore renseignés',
    exposureLow: 'Faible',
    exposureMedium: 'Moyenne',
    exposureHigh: 'Élevée',
    rulesNote: 'Conforme = score effectif ≥ 3 / 5. Exposition réglementaire : Faible ≥ 80 % conformes · Moyenne 50–79 % · Élevée en dessous de 50 %.',
    actionRequired: (n) => `Action requise — ${n} élément${n > 1 ? 's' : ''} à traiter`,
    actionRequiredSub: 'Traitez-les pour améliorer la conformité BCT et réduire l’exposition réglementaire.',
    statusNonCompliant: (e) => `Non conforme · ${e}/5`,
    toReachCompliance: 'Pour atteindre la conformité :',
    pending: 'En attente',
    notYetAssessed: 'Pas encore évalué — renseignez cet indicateur pour déterminer la conformité.',
    allCompliant: (n) => `✓ Les ${n} indicateurs BCT obligatoires sont tous conformes. Aucune action en suspens.`,
    colIndicator: 'Indicateur',
    colDimension: 'Dimension',
    colReference: 'Référence',
    colScore: 'Score',
    colStatus: 'Statut',
    colEvidence: 'Preuve',
    compliant: 'Conforme',
    nonCompliant: 'Non conforme',
    noEvidence: 'Aucune preuve fournie',
    summary: (compliant, total) => `${compliant} indicateurs BCT conformes sur ${total}.`,
    summaryExposure: (e) => `Exposition réglementaire : ${e}`,
    summaryRate: (r) => `${r} % des indicateurs BCT conformes`,
    savePdf: '⤓ Enregistrer en PDF',
    saveEvidence: 'Enregistrer le dossier de preuves BCT',
    saveHint: 'Ouvre la fenêtre d’enregistrement de votre navigateur — choisissez « Enregistrer en PDF » pour télécharger le fichier.',
  },
};

// Maps a raw exposure value ('Low'/'Medium'/'High') to its localized label.
function exposureLabel(c, exposure) {
  if (exposure === 'Low') return c.exposureLow;
  if (exposure === 'Medium') return c.exposureMedium;
  if (exposure === 'High') return c.exposureHigh;
  return exposure;
}

// Derive the regulatory reference from the indicator's own hint (which states
// its basis) instead of a hardcoded id list that goes stale as admins edit
// content: BCBS-based indicators show 'BCBS 239 P<n>', hints leading with a BCT
// article show that reference, everything else the circulaire default.
function getArticleRef(ind) {
  const hint = ind?.hint || '';
  const bcbs = hint.match(/^\s*BCBS\s*239(?:\s*Principle\s*(\d+))?/i);
  if (bcbs) return bcbs[1] ? `BCBS 239 P${bcbs[1]}` : 'BCBS 239';
  const bct = hint.match(/^\s*(BCT[^—–-]+)/);
  if (bct) return bct[1].trim();
  return 'BCT Art. 2025-08';
}

export default function Compliance() {
  const printRef = useRef();
  const getBCTCompliance = useAppStore(s => s.getBCTCompliance);
  const getBCTIndicators = useAppStore(s => s.getBCTIndicators);
  const getEffectiveScore = useAppStore(s => s.getEffectiveScore);
  const answers = useAppStore(s => s.answers);
  const profile = useAppStore(s => s.profile);
  const lang = useSettingsStore(s => s.language);
  useContentStore(s => s.version); // re-render when the questionnaire is re-hydrated
  const c = COPY[lang] || COPY.en;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `DataPilot - ${profile.bankName || 'Bank'} - BCT Compliance`,
  });

  const bctInds = getBCTIndicators();
  const bctData = getBCTCompliance();

  // Items needing attention, for the "action required" summary.
  const nonCompliantItems = bctInds.filter(ind => {
    const e = getEffectiveScore(ind.id);
    return e !== null && e < 3;
  });
  const pendingItems = bctInds.filter(ind => getEffectiveScore(ind.id) === null);
  const actionItems = nonCompliantItems.length + pendingItems.length;

  const exposureColor =
    bctData.exposure === 'Low' ? { color: '#1B5E20', bg: '#E8F5E9' } :
    bctData.exposure === 'Medium' ? { color: '#E65100', bg: '#FFF3E0' } :
    { color: '#B71C1C', bg: '#FDECEA' };

  const complianceColor =
    bctData.rate >= 80 ? '#1B5E20' :
    bctData.rate >= 50 ? '#E65100' : '#B71C1C';

  return (
    <div ref={printRef}>
      <ReportCover
        title={c.coverTitle}
        subtitle={c.coverSubtitle}
        profile={profile}
      />
      <div className="print-content">
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">{c.title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{c.subtitle}</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          {
            num: `${bctData.compliant} / ${bctData.total}`,
            label: c.kpiCompliantLabel,
            sub: c.kpiComplianceRate(bctData.rate),
            topColor: complianceColor,
          },
          {
            num: exposureLabel(c, bctData.exposure),
            label: c.kpiExposureLabel,
            sub: c.kpiExposureSub,
            topColor: exposureColor.color,
            numStyle: { color: exposureColor.color },
          },
          {
            num: bctData.nonCompliant,
            label: c.kpiNonCompliantLabel,
            sub: c.kpiNonCompliantSub,
            topColor: bctData.nonCompliant > 0 ? '#B71C1C' : '#1B5E20',
          },
          {
            num: bctData.pending,
            label: c.kpiPendingLabel,
            sub: c.kpiPendingSub,
            topColor: '#9E9E9E',
          },
        ].map(kpi => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl border border-gray-200 p-4 relative overflow-hidden"
            style={{ borderTopColor: kpi.topColor, borderTopWidth: 3 }}
          >
            <div className="text-2xl font-bold tabular-nums" style={kpi.numStyle || { color: kpi.topColor }}>
              {kpi.num}
            </div>
            <div className="text-xs font-semibold text-gray-700 mt-1">{kpi.label}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Compliance rules note */}
      <p className="text-[11px] text-gray-400 -mt-3 mb-5">
        {c.rulesNote}
      </p>

      {/* Action required — non-compliant + pending items, with remediation */}
      {actionItems > 0 ? (
        <div className="report-table rounded-xl border border-red-200 overflow-hidden mb-6">
          <div className="px-4 py-3 bg-red-50 border-b border-red-100">
            <div className="text-sm font-bold text-red-800">
              {c.actionRequired(actionItems)}
            </div>
            <div className="text-xs text-red-600 mt-0.5">
              {c.actionRequiredSub}
            </div>
          </div>

          {nonCompliantItems.map(ind => {
            const eff = getEffectiveScore(ind.id);
            const fix = (Array.isArray(ind.rubric) && ind.rubric[2]) || ind.hint || '';
            return (
              <div key={ind.id} className="px-4 py-3 border-t border-red-100">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-[10px] text-gray-500">{ind.id}</span>
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-semibold">
                    {c.statusNonCompliant(eff)}
                  </span>
                  <span className="font-mono text-[10px] text-ey-purple">{getArticleRef(ind)}</span>
                </div>
                <div className="text-xs font-medium text-gray-800 leading-snug">{ind.q}</div>
                {fix && (
                  <div className="text-[11px] text-gray-600 mt-1 leading-snug">
                    <span className="font-semibold text-gray-500">{c.toReachCompliance}</span> {fix}
                  </div>
                )}
              </div>
            );
          })}

          {pendingItems.map(ind => (
            <div key={ind.id} className="px-4 py-3 border-t border-red-100">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-mono text-[10px] text-gray-500">{ind.id}</span>
                <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-600 text-[10px] font-semibold">{c.pending}</span>
                <span className="font-mono text-[10px] text-ey-purple">{getArticleRef(ind)}</span>
              </div>
              <div className="text-xs font-medium text-gray-800 leading-snug">{ind.q}</div>
              <div className="text-[11px] text-gray-500 mt-1 italic">
                {c.notYetAssessed}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 mb-6 text-sm font-medium text-green-800">
          {c.allCompliant(bctData.total)}
        </div>
      )}

      {/* Compliance table */}
      <div className="report-table bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div
          className="grid text-[10px] font-bold uppercase tracking-wide text-gray-500 bg-gray-50 border-b border-gray-200 px-4 py-2.5"
          style={{ gridTemplateColumns: '1.6fr 0.7fr 0.7fr 0.5fr 0.8fr 1.4fr' }}
        >
          <div>{c.colIndicator}</div>
          <div>{c.colDimension}</div>
          <div>{c.colReference}</div>
          <div>{c.colScore}</div>
          <div>{c.colStatus}</div>
          <div>{c.colEvidence}</div>
        </div>
        {bctInds.map(ind => {
          const eff = getEffectiveScore(ind.id);
          const ans = answers[ind.id] || {};
          const compliant = eff !== null && eff >= 3;
          const pending = eff === null;
          const articleRef = getArticleRef(ind);
          return (
            <div
              key={ind.id}
              className={`grid items-center px-4 py-3 border-b border-gray-50 last:border-b-0 ${
                !compliant && !pending ? 'bg-red-50' : ''
              }`}
              style={{ gridTemplateColumns: '1.6fr 0.7fr 0.7fr 0.5fr 0.8fr 1.4fr' }}
            >
              <div className="text-xs text-gray-700 leading-snug pr-3">
                <span className="font-mono text-gray-400 text-[10px] block mb-0.5">{ind.id}</span>
                {ind.q.length > 60 ? ind.q.slice(0, 60) + '…' : ind.q}
              </div>
              <div>
                <DimensionPill dim={ind.dim} />
              </div>
              <div>
                <span className="inline-flex px-1.5 py-0.5 rounded border text-[10px] font-mono font-semibold border-ey-purple text-ey-purple">
                  {articleRef}
                </span>
              </div>
              <div>
                <ScoreBadge score={eff} />
              </div>
              <div>
                {pending ? (
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-semibold">{c.pending}</span>
                ) : compliant ? (
                  <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-semibold">{c.compliant}</span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-semibold">{c.nonCompliant}</span>
                )}
              </div>
              <div className="text-xs text-gray-500 italic">
                {ans.evidence ? ans.evidence.slice(0, 70) : c.noEvidence}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <p className="text-sm font-semibold text-gray-800">
          {c.summary(bctData.compliant, bctData.total)}{' '}
          <span style={{ color: exposureColor.color }}>
            {c.summaryExposure(exposureLabel(c, bctData.exposure))}
          </span>
        </p>
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${bctData.rate}%`, background: complianceColor }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-1">{c.summaryRate(bctData.rate)}</div>
      </div>

      {/* Export buttons */}
      <div className="flex flex-col gap-1.5 no-print">
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-ey-yellow text-ey-charcoal font-semibold rounded-lg text-sm hover:bg-yellow-400"
          >
            {c.savePdf}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
          >
            {c.saveEvidence}
          </button>
        </div>
        <span className="text-[11px] text-gray-400">
          {c.saveHint}
        </span>
      </div>
      </div>
    </div>
  );
}
