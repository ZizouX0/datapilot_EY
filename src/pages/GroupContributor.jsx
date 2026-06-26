import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAssessmentStore from '../store/useAssessmentStore';
import { INDICATORS, DIMENSIONS, SUBDIM_NAMES } from '../data/indicators';
import BCTBadge from '../components/ui/BCTBadge';

const LEVEL_NAMES = ['Initial', 'Emerging', 'Defined', 'Managed', 'Optimized'];
const LEVEL_COLORS = ['#B71C1C', '#E65100', '#827717', '#1B5E20', '#0D47A1'];

// Analyst contributor view for a group (Model B) assessment. Shows ONLY the
// dimensions assigned to the analyst's department and writes each answer to the
// shared, server-side draft (useAssessmentStore). The coordinator finalizes;
// the analyst just fills their slice. Solo assessments are unaffected.
export default function GroupContributor() {
  const navigate = useNavigate();
  const { assessment, answers, loading, loadActive, saveAnswer, myAssignedDims } = useAssessmentStore();
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState(null);
  const [evidenceDraft, setEvidenceDraft] = useState({});

  useEffect(() => { loadActive(); }, [loadActive]);

  if (loading) return <p className="text-gray-400 py-32 text-center animate-pulse">Loading…</p>;

  const isDraft = assessment && assessment.status === 'draft';
  const myDims = isDraft ? myAssignedDims() : [];
  const dimsToShow = Object.keys(DIMENSIONS).filter(d => myDims.includes(d));

  // Nothing to do — no draft, or nothing assigned to this analyst's department.
  if (dimsToShow.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-10 rounded-xl border border-gray-200 bg-white p-8 text-center">
        <div className="text-3xl mb-2">📋</div>
        <h1 className="text-lg font-semibold text-gray-800">Nothing assigned to you yet</h1>
        <p className="text-sm text-gray-500 mt-1">
          {assessment
            ? 'There’s no open group assessment dimension assigned to your department right now.'
            : 'Your bank has no active group assessment yet.'}
          {' '}Your coordinator assigns dimensions to departments.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
        >← Back</button>
      </div>
    );
  }

  // Indicators I'm responsible for (across my assigned dimensions).
  const myIndicators = INDICATORS.filter(i => myDims.includes(i.dim));
  const answered = myIndicators.filter(i => {
    const a = answers[i.id];
    return a && (a.skipped || (a.score !== null && a.score !== undefined));
  }).length;

  async function persist(ind, patch) {
    setBusyId(ind.id); setErr(null);
    const { error } = await saveAnswer(ind.id, ind.dim, patch);
    setBusyId(null);
    if (error) setErr(error);
  }

  const evidenceValue = (id) => (id in evidenceDraft ? evidenceDraft[id] : (answers[id]?.evidence ?? ''));

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <div className="rounded-xl border border-ey-yellow bg-yellow-50 px-5 py-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-ey-charcoal/60">Group assessment</div>
        <h1 className="text-lg font-semibold text-gray-800">{assessment.title || 'Data Maturity Assessment'}</h1>
        <p className="text-sm text-gray-600 mt-0.5">
          Your department owns {dimsToShow.length} dimension{dimsToShow.length > 1 ? 's' : ''}:
          {' '}<span className="font-medium">{dimsToShow.map(d => `${d} ${DIMENSIONS[d].name}`).join(', ')}</span>.
          Answers save automatically to the shared assessment.
        </p>
        <div className="mt-2 text-xs text-gray-500">{answered} of {myIndicators.length} of your indicators answered</div>
      </div>

      {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}

      {dimsToShow.map(d => {
        const dim = DIMENSIONS[d];
        return (
          <div key={d} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: dim.color }} />
              <h2 className="text-base font-semibold text-gray-800">{d} · {dim.name}</h2>
            </div>
            {dim.subDims.map(sub => (
              <div key={sub} className="flex flex-col gap-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{sub} · {SUBDIM_NAMES[sub]}</div>
                {INDICATORS.filter(i => i.sub === sub).map(ind => {
                  const ans = answers[ind.id] || {};
                  const score = ans.score ?? null;
                  const skipped = ans.skipped ?? false;
                  return (
                    <div key={ind.id} className={`bg-white rounded-xl border p-5 ${skipped ? 'opacity-60' : ''} border-gray-200`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-ey-charcoal text-ey-yellow text-xs font-mono px-2 py-0.5 rounded">{ind.id}</span>
                        {ind.bct && <BCTBadge />}
                        {skipped && <span className="text-xs text-gray-400 italic">Skipped</span>}
                      </div>
                      <p className="text-sm font-medium text-gray-800 leading-relaxed mt-3">{ind.q}</p>
                      {ind.hint && (
                        <div className="bg-gray-50 border-l-4 border-gray-300 px-3 py-2 mt-2 rounded-r text-xs text-gray-500 italic">{ind.hint}</div>
                      )}

                      {!skipped && (
                        <>
                          <div className="flex gap-2 mt-4">
                            {LEVEL_NAMES.map((name, i) => {
                              const sval = i + 1;
                              const selected = score === sval;
                              return (
                                <button
                                  key={sval}
                                  disabled={busyId === ind.id}
                                  onClick={() => persist(ind, { score: sval, skipped: false })}
                                  className={`flex-1 py-2 rounded-lg border-2 text-center transition-all disabled:opacity-50 ${
                                    selected ? 'border-transparent text-white' : 'bg-gray-50 border-gray-200 hover:border-gray-400 text-gray-600'
                                  }`}
                                  style={selected ? { background: LEVEL_COLORS[i], borderColor: LEVEL_COLORS[i] } : {}}
                                >
                                  <div className="text-lg font-bold">{sval}</div>
                                  <div className="text-[10px] mt-0.5">{name}</div>
                                </button>
                              );
                            })}
                          </div>
                          {score >= 3 && (!evidenceValue(ind.id) || evidenceValue(ind.id).trim() === '') && (
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-2 rounded mt-2">
                              ⚠ Without documented evidence, this score will be capped at 2/5.
                            </div>
                          )}
                          <div className="mt-3">
                            <label className="text-xs text-gray-500">Evidence reference (optional)</label>
                            <textarea
                              className="w-full border border-gray-200 rounded-lg p-2 text-xs text-gray-700 mt-1 h-16 resize-none focus:outline-none focus:ring-1 focus:ring-ey-yellow"
                              placeholder="Describe the evidence supporting your score…"
                              value={evidenceValue(ind.id)}
                              onChange={e => setEvidenceDraft(s => ({ ...s, [ind.id]: e.target.value }))}
                              onBlur={() => {
                                if ((evidenceDraft[ind.id] ?? '') !== (ans.evidence ?? '')) {
                                  persist(ind, { evidence: evidenceDraft[ind.id] ?? '' });
                                }
                              }}
                            />
                          </div>
                        </>
                      )}

                      {!ind.bct && (
                        <div className="mt-2 flex justify-end">
                          <button
                            disabled={busyId === ind.id}
                            onClick={() => persist(ind, { skipped: !skipped, score: skipped ? score : null })}
                            className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-40"
                          >{skipped ? 'Undo skip' : 'Skip this indicator'}</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}

      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-600 text-center">
        Your answers are saved automatically. Your coordinator reviews everyone’s input and finalizes the assessment.
      </div>
    </div>
  );
}
