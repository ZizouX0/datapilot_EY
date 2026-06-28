import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAssessmentStore from '../store/useAssessmentStore';
import useAuthStore from '../store/useAuthStore';
import useSettingsStore from '../store/useSettingsStore';
import { INDICATORS, DIMENSIONS, SUBDIM_NAMES } from '../data/indicators';
import BCTBadge from '../components/ui/BCTBadge';

// Maturity-scale labels stay on the CMMI/Gartner scale (English), matching the
// solo assessment — they are part of the scoring method, not UI chrome.
const LEVEL_NAMES = ['Initial', 'Emerging', 'Defined', 'Managed', 'Optimized'];
const LEVEL_COLORS = ['#B71C1C', '#E65100', '#827717', '#1B5E20', '#0D47A1'];

const COPY = {
  en: {
    loading: 'Loading…',
    emptyTitle: 'Nothing assigned to you yet',
    emptyWithAssessment: 'There’s no open group assessment dimension assigned to your department right now.',
    emptyNoAssessment: 'Your bank has no active group assessment yet.',
    emptyTail: 'Your coordinator assigns dimensions to departments.',
    back: '← Back',
    eyebrow: 'Group assessment',
    defaultTitle: 'Data Maturity Assessment',
    owns: (n) => `Your department owns ${n} dimension${n > 1 ? 's' : ''}:`,
    autosave: 'Answers save automatically to the shared assessment.',
    answered: (done, total) => `${done} of ${total} of your indicators answered`,
    skipped: 'Skipped',
    evidenceCap: '⚠ Without documented evidence, this score will be capped at 2/5.',
    evidenceLabel: 'Evidence reference (optional)',
    evidencePlaceholder: 'Describe the evidence supporting your score…',
    skip: 'Skip this indicator',
    undoSkip: 'Undo skip',
    skipLimit: (dim, n) => `Skip limit reached for ${dim}. Maximum ${n} indicator${n > 1 ? 's' : ''} may be skipped per dimension.`,
    footer: 'Your answers are saved automatically. Your coordinator reviews everyone’s input and finalizes the assessment.',
    finalized: 'Finalized',
    finalizedNote: 'This assessment has been finalized. Your answers are shown below, read-only.',
    global: 'Global score',
    maturity: 'Maturity',
    level: (n) => `Level ${n}`,
  },
  fr: {
    loading: 'Chargement…',
    emptyTitle: 'Rien ne vous est encore affecté',
    emptyWithAssessment: 'Aucune dimension d’évaluation groupée n’est affectée à votre département pour le moment.',
    emptyNoAssessment: 'Votre banque n’a pas encore d’évaluation groupée active.',
    emptyTail: 'Votre coordinateur affecte les dimensions aux départements.',
    back: '← Retour',
    eyebrow: 'Évaluation groupée',
    defaultTitle: 'Évaluation de la maturité des données',
    owns: (n) => `Votre département possède ${n} dimension${n > 1 ? 's' : ''} :`,
    autosave: 'Les réponses sont enregistrées automatiquement dans l’évaluation partagée.',
    answered: (done, total) => `${done} sur ${total} de vos indicateurs renseignés`,
    skipped: 'Ignoré',
    evidenceCap: '⚠ Sans preuve documentée, ce score sera plafonné à 2/5.',
    evidenceLabel: 'Référence de la preuve (facultatif)',
    evidencePlaceholder: 'Décrivez la preuve qui justifie votre score…',
    skip: 'Ignorer cet indicateur',
    undoSkip: 'Annuler',
    skipLimit: (dim, n) => `Limite atteinte pour ${dim}. Au maximum ${n} indicateur${n > 1 ? 's' : ''} peuvent être ignorés par dimension.`,
    footer: 'Vos réponses sont enregistrées automatiquement. Votre coordinateur examine les contributions de chacun et finalise l’évaluation.',
    finalized: 'Finalisée',
    finalizedNote: 'Cette évaluation a été finalisée. Vos réponses sont affichées ci-dessous, en lecture seule.',
    global: 'Score global',
    maturity: 'Maturité',
    level: (n) => `Niveau ${n}`,
  },
};

// Analyst contributor view for a group (Model B) assessment. Shows ONLY the
// dimensions assigned to the analyst's department and writes each answer to the
// shared, server-side draft. The coordinator finalizes.
export default function GroupContributor() {
  const navigate = useNavigate();
  const { assessment, answers, loading, loadActive, saveAnswer, myAssignedDims, scores } = useAssessmentStore();
  useAssessmentStore(s => s.assignments); // re-render when assignments load
  const refreshProfile = useAuthStore(s => s.refreshProfile);
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState(null);
  const [evidenceDraft, setEvidenceDraft] = useState({});

  // Refresh BOTH the profile (department may have just been assigned) and the
  // assessment on entry, so a fresh assignment shows up without a re-login.
  useEffect(() => { refreshProfile(); loadActive(); }, [refreshProfile, loadActive]);

  if (loading) return <p className="text-gray-400 py-32 text-center animate-pulse">{c.loading}</p>;

  const readOnly = !assessment || assessment.status !== 'draft';
  const myDims = assessment ? myAssignedDims() : [];
  const dimsToShow = Object.keys(DIMENSIONS).filter(d => myDims.includes(d));

  if (dimsToShow.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-10 rounded-xl border border-gray-200 bg-white p-8 text-center">
        <div className="text-3xl mb-2">📋</div>
        <h1 className="text-lg font-semibold text-gray-800">{c.emptyTitle}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {assessment ? c.emptyWithAssessment : c.emptyNoAssessment} {c.emptyTail}
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
        >{c.back}</button>
      </div>
    );
  }

  const myIndicators = INDICATORS.filter(i => myDims.includes(i.dim));
  const answered = myIndicators.filter(i => {
    const a = answers[i.id];
    return a && (a.skipped || (a.score !== null && a.score !== undefined));
  }).length;
  const sc = scores();

  async function persist(ind, patch) {
    setBusyId(ind.id); setErr(null);
    const { error } = await saveAnswer(ind.id, ind.dim, patch);
    setBusyId(null);
    if (error) setErr(error);
  }

  // Skip toggle with the same 20%-per-dimension limit the solo flow enforces.
  function toggleSkip(ind, currentlySkipped) {
    if (!currentlySkipped) {
      const limit = Math.floor(INDICATORS.filter(i => i.dim === ind.dim).length * 0.20);
      const currentSkips = INDICATORS.filter(i => i.dim === ind.dim && answers[i.id]?.skipped).length;
      if (currentSkips >= limit) { setErr(c.skipLimit(ind.dim, limit)); return; }
    }
    persist(ind, { skipped: !currentlySkipped, score: currentlySkipped ? (answers[ind.id]?.score ?? null) : null });
  }

  const evidenceValue = (id) => (id in evidenceDraft ? evidenceDraft[id] : (answers[id]?.evidence ?? ''));

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <div className="rounded-xl border border-ey-yellow bg-yellow-50 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ey-charcoal/60">{c.eyebrow}</div>
          {readOnly && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide bg-gray-200 text-gray-600">{c.finalized}</span>
          )}
        </div>
        <h1 className="text-lg font-semibold text-gray-800">{assessment.title || c.defaultTitle}</h1>
        <p className="text-sm text-gray-600 mt-0.5">
          {c.owns(dimsToShow.length)}{' '}
          <span className="font-medium">{dimsToShow.map(d => `${d} ${DIMENSIONS[d].name}`).join(', ')}</span>.
          {' '}{readOnly ? c.finalizedNote : c.autosave}
        </p>
        {readOnly ? (
          <div className="mt-3 flex items-center gap-6">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{c.global}</div>
              <div className="text-2xl font-bold font-mono text-ey-charcoal">{sc.globalScore != null ? sc.globalScore.toFixed(2) : '—'}<span className="text-sm text-gray-400">/5</span></div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{c.maturity}</div>
              <div className="text-lg font-semibold text-gray-700">{sc.maturityLevel ? c.level(sc.maturityLevel) : '—'}</div>
            </div>
          </div>
        ) : (
          <div className="mt-2 text-xs text-gray-500">{c.answered(answered, myIndicators.length)}</div>
        )}
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
                        {skipped && <span className="text-xs text-gray-400 italic">{c.skipped}</span>}
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
                                  disabled={busyId === ind.id || readOnly}
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
                              {c.evidenceCap}
                            </div>
                          )}
                          <div className="mt-3">
                            <label className="text-xs text-gray-500">{c.evidenceLabel}</label>
                            <textarea
                              className="w-full border border-gray-200 rounded-lg p-2 text-xs text-gray-700 mt-1 h-16 resize-none focus:outline-none focus:ring-1 focus:ring-ey-yellow disabled:bg-gray-50"
                              placeholder={c.evidencePlaceholder}
                              value={evidenceValue(ind.id)}
                              disabled={readOnly}
                              onChange={e => setEvidenceDraft(s => ({ ...s, [ind.id]: e.target.value }))}
                              onBlur={() => {
                                if (ind.id in evidenceDraft) {
                                  const draft = evidenceDraft[ind.id] ?? '';
                                  // Compare against the LATEST stored value, not a stale render closure.
                                  const stored = useAssessmentStore.getState().answers[ind.id]?.evidence ?? '';
                                  if (draft !== stored) persist(ind, { evidence: draft });
                                }
                              }}
                            />
                          </div>
                        </>
                      )}

                      {!ind.bct && !readOnly && (
                        <div className="mt-2 flex justify-end">
                          <button
                            disabled={busyId === ind.id}
                            onClick={() => toggleSkip(ind, skipped)}
                            className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-40"
                          >{skipped ? c.undoSkip : c.skip}</button>
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
        {c.footer}
      </div>
    </div>
  );
}
