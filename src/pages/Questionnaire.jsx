import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import { INDICATORS, DIMENSIONS, SUBDIM_NAMES } from '../data/indicators';
import BCTBadge from '../components/ui/BCTBadge';
import ProxyBadge from '../components/ui/ProxyBadge';

const LEVEL_NAMES = ['Initial', 'Emerging', 'Defined', 'Managed', 'Optimized'];
const GARTNER = ['Unaware', 'Aware', 'Active', 'Effective', 'Transformative'];
const LEVEL_COLORS = ['#B71C1C', '#E65100', '#827717', '#1B5E20', '#0D47A1'];

export default function Questionnaire() {
  const navigate = useNavigate();
  const answers = useAppStore(s => s.answers);
  const activeDimension = useAppStore(s => s.activeDimension);
  const activeSubDim = useAppStore(s => s.activeSubDim);
  const setAnswer = useAppStore(s => s.setAnswer);
  const setEvidence = useAppStore(s => s.setEvidence);
  const skipIndicator = useAppStore(s => s.skipIndicator);
  const unskipIndicator = useAppStore(s => s.unskipIndicator);
  const setActiveDimension = useAppStore(s => s.setActiveDimension);
  const setActiveSubDim = useAppStore(s => s.setActiveSubDim);
  const getDimScore = useAppStore(s => s.getDimScore);
  const getSubDimScore = useAppStore(s => s.getSubDimScore);
  const getEffectiveScore = useAppStore(s => s.getEffectiveScore);
  const getSkipCount = useAppStore(s => s.getSkipCount);
  const getSkipLimit = useAppStore(s => s.getSkipLimit);
  const isEvidenceCapped = useAppStore(s => s.isEvidenceCapped);
  const getAnsweredCount = useAppStore(s => s.getAnsweredCount);
  const getCappedCount = useAppStore(s => s.getCappedCount);
  const isAssessmentComplete = useAppStore(s => s.isAssessmentComplete());
  const getDimStatus = useAppStore(s => s.getDimStatus);

  const [openRubrics, setOpenRubrics] = useState({});
  const [skipErrors, setSkipErrors] = useState({});

  const dims = Object.keys(DIMENSIONS);
  const currentDimData = DIMENSIONS[activeDimension];
  const subDims = currentDimData.subDims;
  const currentInds = INDICATORS.filter(i => i.sub === activeSubDim);

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goNext() {
    const subIdx = subDims.indexOf(activeSubDim);
    if (subIdx < subDims.length - 1) {
      setActiveSubDim(subDims[subIdx + 1]);
      scrollTop();
    } else {
      const dimIdx = dims.indexOf(activeDimension);
      if (dimIdx < dims.length - 1) {
        setActiveDimension(dims[dimIdx + 1]);
        scrollTop();
      } else {
        navigate('/results');
      }
    }
  }

  function goPrev() {
    const subIdx = subDims.indexOf(activeSubDim);
    if (subIdx > 0) {
      setActiveSubDim(subDims[subIdx - 1]);
      scrollTop();
    } else {
      const dimIdx = dims.indexOf(activeDimension);
      if (dimIdx > 0) {
        const prevDim = dims[dimIdx - 1];
        const prevSubs = DIMENSIONS[prevDim].subDims;
        setActiveDimension(prevDim);
        setActiveSubDim(prevSubs[prevSubs.length - 1]);
        scrollTop();
      }
    }
  }

  const isLastSubDim = () => {
    const subIdx = subDims.indexOf(activeSubDim);
    const dimIdx = dims.indexOf(activeDimension);
    return subIdx === subDims.length - 1 && dimIdx === dims.length - 1;
  };

  const cappedCount = getCappedCount();


  return (
    <div className="flex flex-col gap-4">
      {/* Success banner */}
      {isAssessmentComplete && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              ✓
            </div>
            <div>
              <div className="text-sm font-semibold text-green-800">Assessment complete.</div>
              <div className="text-xs text-green-600 mt-0.5">All 5 dimensions fully answered. Your results are ready.</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/results')}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg text-sm hover:bg-green-700 flex-shrink-0"
          >
            View Results →
          </button>
        </div>
      )}

      {/* Dimension tabs */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200">
        {dims.map(dim => {
          const d = DIMENSIONS[dim];
          const dimInds = INDICATORS.filter(i => i.dim === dim);
          const answered = dimInds.filter(i => {
            const ans = answers[i.id];
            return ans && (ans.skipped || ans.score !== null);
          }).length;
          const status = getDimStatus(dim);
          const isActive = dim === activeDimension;

          const statusIcon =
            status === 'complete' ? (
              <span className="text-green-400 text-xs">✓</span>
            ) : status === 'inprogress' ? (
              <span className="w-2 h-2 rounded-full bg-ey-yellow inline-block" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
            );

          return (
            <button
              key={dim}
              onClick={() => { setActiveDimension(dim); scrollTop(); }}
              className={`flex-1 py-2.5 px-2 text-center border-r last:border-r-0 border-gray-200 transition-all ${
                isActive ? 'text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
              style={isActive ? { background: d.color } : {}}
            >
              <div className="flex items-center justify-center gap-1">
                <span className="text-sm font-bold">{dim}</span>
                {statusIcon}
              </div>
              <div className="text-[10px] opacity-80 mt-0.5">{d.name.split(' ')[0]}</div>
              {d.proxy
                ? <div className="text-[9px] mt-0.5 opacity-90 font-semibold">Proxy</div>
                : <div className="text-[9px] mt-0.5 opacity-70">{answered}/{dimInds.length}</div>
              }
            </button>
          );
        })}
      </div>

      {/* Sub-dimension pills */}
      <div className="flex gap-2">
        {subDims.map(sd => {
          const sdInds = INDICATORS.filter(i => i.sub === sd);
          const allDone = sdInds.every(i => {
            const ans = answers[i.id];
            return ans && (ans.skipped || ans.score !== null);
          });
          const isActive = sd === activeSubDim;
          return (
            <button
              key={sd}
              onClick={() => setActiveSubDim(sd)}
              className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                isActive
                  ? 'border-ey-charcoal bg-ey-charcoal text-ey-yellow'
                  : allDone
                  ? 'border-teal-300 bg-teal-50 text-teal-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400'
              }`}
            >
              {sd} · {SUBDIM_NAMES[sd]}
            </button>
          );
        })}
      </div>

      {/* Main layout */}
      <div className="flex gap-4 items-start">
        {/* Indicator cards */}
        <div className="flex-1 flex flex-col gap-4">
          {/* D5 proxy notice */}
          {activeDimension === 'D5' && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-gray-400 text-base flex-shrink-0 mt-0.5">ℹ</span>
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-700">D5 uses proxy-based indicators only.</span>{' '}
                Scores reflect observable organizational signals, not direct self-assessment.
                Results are indicative and weighted at 15% of the global score.
              </p>
            </div>
          )}
          {currentInds.map(ind => {
            const ans = answers[ind.id] || {};
            const score = ans.score ?? null;
            const evidence = ans.evidence ?? '';
            const skipped = ans.skipped ?? false;
            const effScore = getEffectiveScore(ind.id);
            const capped = isEvidenceCapped(ind.id);
            const rubricOpen = openRubrics[ind.id] ?? false;
            const skipCount = getSkipCount(ind.dim);
            const skipLimit = getSkipLimit(ind.dim);
            const atSkipLimit = !ind.bct && skipCount >= skipLimit && !skipped;

            return (
              <div
                key={ind.id}
                className={`bg-white rounded-xl border p-5 ${skipped ? 'opacity-60 border-gray-200' : 'border-gray-200'}`}
              >
                {/* Header */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-ey-charcoal text-ey-yellow text-xs font-mono px-2 py-0.5 rounded">
                    {ind.id}
                  </span>
                  {ind.bct && <BCTBadge />}
                  {ind.dim === 'D5' && <ProxyBadge />}
                  {skipped && (
                    <span className="text-xs text-gray-400 italic">Skipped</span>
                  )}
                </div>

                {/* Question */}
                <p className="text-sm font-medium text-gray-800 leading-relaxed mt-3">
                  {ind.q}
                </p>

                {/* Hint */}
                <div className="bg-gray-50 border-l-4 border-gray-300 px-3 py-2 mt-2 rounded-r text-xs text-gray-500 italic">
                  {ind.hint}
                </div>

                {!skipped && (
                  <>
                    {/* Score picker */}
                    <div className="flex gap-2 mt-4">
                      {LEVEL_NAMES.map((name, i) => {
                        const s = i + 1;
                        const selected = score === s;
                        return (
                          <button
                            key={s}
                            onClick={() => setAnswer(ind.id, s)}
                            className={`flex-1 py-2 rounded-lg border-2 text-center transition-all ${
                              selected ? 'border-transparent text-white' : 'bg-gray-50 border-gray-200 hover:border-gray-400 text-gray-600'
                            }`}
                            style={selected ? { background: LEVEL_COLORS[i], borderColor: LEVEL_COLORS[i] } : {}}
                          >
                            <div className="text-lg font-bold">{s}</div>
                            <div className="text-[10px] mt-0.5">{name}</div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Evidence cap warning */}
                    {capped && (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-2 rounded mt-2">
                        ⚠ Without documented evidence, this score will be capped at 2/5.
                      </div>
                    )}

                    {/* Scoring guide */}
                    <div className="mt-3">
                      <button
                        onClick={() => setOpenRubrics(o => ({ ...o, [ind.id]: !o[ind.id] }))}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <span>{rubricOpen ? '▲' : '▼'}</span>
                        <span>Scoring guide for this indicator</span>
                      </button>
                      {rubricOpen && (
                        <div className="mt-2 border border-gray-100 rounded-lg overflow-hidden">
                          {ind.rubric.map((desc, i) => {
                            const isActive = score === i + 1;
                            return (
                              <div
                                key={i}
                                className={`grid text-xs border-b last:border-b-0 border-gray-100 ${
                                  isActive ? 'bg-yellow-50' : ''
                                }`}
                                style={{
                                  gridTemplateColumns: '48px 80px 1fr',
                                  borderLeft: isActive ? '3px solid #FFE600' : '3px solid transparent',
                                }}
                              >
                                <div className="flex flex-col items-center justify-center py-2 px-1 border-r border-gray-100">
                                  <span className="font-bold" style={{ color: LEVEL_COLORS[i] }}>{i + 1}</span>
                                  <span className="text-[9px] mt-0.5" style={{ color: LEVEL_COLORS[i] }}>{LEVEL_NAMES[i]}</span>
                                </div>
                                <div className="flex flex-col justify-center py-2 px-2 border-r border-gray-100">
                                  <span className="font-semibold" style={{ color: LEVEL_COLORS[i] }}>{LEVEL_NAMES[i]}</span>
                                  <span className="italic text-gray-400 text-[9px]">{GARTNER[i]}</span>
                                </div>
                                <div className="py-2 px-3 text-gray-600 leading-relaxed flex items-center">{desc}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Evidence */}
                    <div className="mt-3">
                      <label className="text-xs text-gray-500">Evidence reference (optional)</label>
                      <textarea
                        className="w-full border border-gray-200 rounded-lg p-2 text-xs text-gray-700 mt-1 h-16 resize-none focus:outline-none focus:ring-1 focus:ring-ey-yellow"
                        placeholder="Describe the evidence supporting your score..."
                        value={evidence}
                        onChange={e => setEvidence(ind.id, e.target.value)}
                      />
                    </div>

                    {/* Footer */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${capped ? 'text-orange-500' : 'text-gray-500'}`}>
                          {effScore !== null
                            ? `Effective score: ${effScore}/5${capped ? ' (capped)' : ''}`
                            : 'No score selected'}
                        </span>
                        {!ind.bct && (
                          <button
                            onClick={() => {
                              if (skipped) {
                                unskipIndicator(ind.id);
                                setSkipErrors(e => ({ ...e, [ind.id]: null }));
                              } else if (atSkipLimit) {
                                setSkipErrors(e => ({
                                  ...e,
                                  [ind.id]: `Skip limit reached for ${ind.dim}. Maximum ${skipLimit} indicator${skipLimit > 1 ? 's' : ''} may be skipped per dimension.`,
                                }));
                              } else {
                                skipIndicator(ind.id);
                                setSkipErrors(e => ({ ...e, [ind.id]: null }));
                              }
                            }}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >
                            {skipped ? 'Undo skip' : 'Skip this indicator'}
                          </button>
                        )}
                      </div>
                      {skipErrors[ind.id] && (
                        <div className="mt-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-1.5">
                          {skipErrors[ind.id]}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {skipped && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => unskipIndicator(ind.id)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Undo skip
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-3 sticky top-28">
          {/* Live score */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-3">
              {activeDimension} Live Score
            </div>
            {(() => {
              const s = getDimScore(activeDimension);
              return (
                <>
                  <div
                    className="text-4xl font-bold font-mono text-center"
                    style={{ color: s !== null ? currentDimData.color : '#CBD5E1' }}
                  >
                    {s !== null ? s.toFixed(2) : '—'}
                  </div>
                  <div className="text-xs text-center text-gray-400 mt-1">/ 5.00</div>
                  <div className="mt-3 flex flex-col gap-1.5">
                    {subDims.map(sd => {
                      const sdScore = getSubDimScore(sd);
                      return (
                        <div key={sd} className="flex items-center gap-2 text-xs">
                          <span className="text-gray-400 font-mono w-8">{sd}</span>
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: sdScore !== null ? `${(sdScore / 5) * 100}%` : '0%',
                                background: currentDimData.color,
                              }}
                            />
                          </div>
                          <span className="font-semibold w-10 text-right" style={{ color: currentDimData.color }}>
                            {sdScore !== null ? sdScore.toFixed(2) : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {cappedCount > 0 && (
                    <div className="mt-2 text-[10px] text-orange-600 bg-orange-50 rounded px-2 py-1">
                      ⚠ Evidence cap active on {cappedCount} indicator{cappedCount > 1 ? 's' : ''}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Rules reminder */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-3">Scoring Rules</div>
            <div className="flex flex-col gap-2">
              {[
                { color: '#FFE600', text: 'BCT indicators cannot be skipped' },
                { color: '#E65100', text: 'Score ≥ 3 without evidence → capped at 2/5' },
                { color: '#27ACAA', text: `Max ${getSkipLimit(activeDimension)} skips allowed in ${activeDimension}` },
              ].map(r => (
                <div key={r.text} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: r.color }} />
                  <span className="text-xs text-gray-600">{r.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* All dimensions progress */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-3">Overall Progress</div>
            <div className="flex flex-col gap-2">
              {Object.entries(DIMENSIONS).map(([dim, d]) => {
                const dimInds = INDICATORS.filter(i => i.dim === dim);
                const done = dimInds.filter(i => {
                  const a = answers[i.id];
                  return a && (a.skipped || a.score !== null);
                }).length;
                return (
                  <div key={dim}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="font-medium" style={{ color: d.color }}>{dim}</span>
                      <span className="text-gray-400">{done}/{dimInds.length}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(done / dimInds.length) * 100}%`, background: d.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 py-3 px-6 flex items-center justify-between no-print -mx-6">
        <button
          onClick={goPrev}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          ← Previous
        </button>
        <span className="text-sm text-gray-500">
          {getAnsweredCount()} of {INDICATORS.length} indicators answered
        </span>
        {isLastSubDim() ? (
          <button
            onClick={() => navigate('/results')}
            className="px-5 py-2 bg-ey-yellow text-ey-charcoal font-semibold rounded-lg text-sm hover:bg-yellow-400"
          >
            View Results →
          </button>
        ) : (
          <button
            onClick={goNext}
            className="px-5 py-2 bg-ey-charcoal text-ey-yellow font-semibold rounded-lg text-sm hover:bg-gray-800"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
