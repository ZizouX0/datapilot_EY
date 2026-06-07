import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import useAppStore from '../store/useAppStore';
import ScoreBadge from '../components/ui/ScoreBadge';
import DimensionPill from '../components/ui/DimensionPill';
import ReportCover from '../components/ReportCover';

function getArticleRef(id) {
  const bcbs = ['D1.3-03'];
  if (bcbs.includes(id)) return 'BCBS 239 P2';
  return 'BCT Art. 2025-08';
}

export default function Compliance() {
  const printRef = useRef();
  const getBCTCompliance = useAppStore(s => s.getBCTCompliance);
  const getBCTIndicators = useAppStore(s => s.getBCTIndicators);
  const getEffectiveScore = useAppStore(s => s.getEffectiveScore);
  const answers = useAppStore(s => s.answers);
  const profile = useAppStore(s => s.profile);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `DataPilot - ${profile.bankName || 'Bank'} - BCT Compliance`,
  });

  const bctInds = getBCTIndicators();
  const bctData = getBCTCompliance();

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
        title="BCT Regulatory Compliance"
        subtitle="Circulaire N°2025-08 & BCBS 239 alignment"
        profile={profile}
      />
      <div className="print-content">
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">BCT Regulatory Compliance</h2>
        <p className="text-sm text-gray-500 mt-0.5">BCT Circulaire N°2025-08 and BCBS 239 alignment status</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          {
            num: `${bctData.compliant} / ${bctData.total}`,
            label: 'Compliant Indicators',
            sub: `${bctData.rate}% compliance rate`,
            topColor: complianceColor,
          },
          {
            num: bctData.exposure,
            label: 'Regulatory Exposure',
            sub: 'Based on compliance rate',
            topColor: exposureColor.color,
            numStyle: { color: exposureColor.color },
          },
          {
            num: bctData.nonCompliant,
            label: 'Non-Compliant',
            sub: 'Indicators scoring below 3',
            topColor: bctData.nonCompliant > 0 ? '#B71C1C' : '#1B5E20',
          },
          {
            num: bctData.pending,
            label: 'Pending',
            sub: 'Not yet answered',
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

      {/* Compliance table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div
          className="grid text-[10px] font-bold uppercase tracking-wide text-gray-400 border-b border-gray-100 px-4 py-2"
          style={{ gridTemplateColumns: '1.6fr 0.7fr 0.7fr 0.5fr 0.8fr 1.4fr' }}
        >
          <div>Indicator</div>
          <div>Dimension</div>
          <div>Reference</div>
          <div>Score</div>
          <div>Status</div>
          <div>Evidence</div>
        </div>
        {bctInds.map(ind => {
          const eff = getEffectiveScore(ind.id);
          const ans = answers[ind.id] || {};
          const compliant = eff !== null && eff >= 3;
          const pending = eff === null;
          const articleRef = getArticleRef(ind.id);
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
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-semibold">Pending</span>
                ) : compliant ? (
                  <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-semibold">Compliant</span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-semibold">Non-compliant</span>
                )}
              </div>
              <div className="text-xs text-gray-500 italic">
                {ans.evidence ? ans.evidence.slice(0, 70) : 'No evidence provided'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <p className="text-sm font-semibold text-gray-800">
          {bctData.compliant} of {bctData.total} BCT indicators compliant.{' '}
          <span style={{ color: exposureColor.color }}>
            Regulatory exposure: {bctData.exposure}
          </span>
        </p>
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${bctData.rate}%`, background: complianceColor }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-1">{bctData.rate}% of BCT indicators compliant</div>
      </div>

      {/* Export buttons */}
      <div className="flex gap-3 no-print">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-ey-yellow text-ey-charcoal font-semibold rounded-lg text-sm hover:bg-yellow-400"
        >
          Export Compliance Report
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
        >
          Export BCT Evidence Package
        </button>
      </div>
      </div>
    </div>
  );
}
