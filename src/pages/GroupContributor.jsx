import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAssessmentStore from '../store/useAssessmentStore';
import useAuthStore from '../store/useAuthStore';
import useSettingsStore from '../store/useSettingsStore';
import { INDICATORS, DIMENSIONS } from '../data/indicators';
import { effectiveScore as effFn, subDimScore as subFn, dimScore as dimFn, globalScore as globalFn, maturityLevel as matFn } from '../lib/scoring';
import AssessmentRunner from '../components/assessment/AssessmentRunner';

// Group (Model B) contributor. Renders the SAME AssessmentRunner as the solo
// flow, but: (a) only the dimensions assigned to the analyst's department, and
// (b) every answer auto-saves to the shared server draft. The coordinator
// finalizes; a finalized assessment renders read-only with the scores.
const COPY = {
  en: {
    loading: 'Loading…',
    emptyTitle: 'Nothing assigned to you yet',
    emptyWithAssessment: 'There’s no open group assessment dimension assigned to your department right now.',
    emptyNoAssessment: 'Your bank has no active group assessment yet.',
    emptyTail: 'Your coordinator assigns dimensions to departments.',
    loadFailedTitle: 'Couldn’t load the group assessment',
    loadFailedBody: 'The server couldn’t be reached. Your assignment may still exist — check your connection and try again.',
    retry: 'Try again',
    back: '← Back',
    eyebrow: 'Group assessment',
    finalized: 'Finalized',
    defaultTitle: 'Data Maturity Assessment',
    owns: (n, list) => `Your department owns ${n} dimension${n > 1 ? 's' : ''}: ${list}. Answers save automatically.`,
    finalizedNote: 'This assessment has been finalized — your answers are read-only.',
    global: 'Global score', maturity: 'Maturity', level: (n) => `Level ${n}`,
  },
  fr: {
    loading: 'Chargement…',
    emptyTitle: 'Rien ne vous est encore affecté',
    emptyWithAssessment: 'Aucune dimension d’évaluation groupée n’est affectée à votre département pour le moment.',
    emptyNoAssessment: 'Votre banque n’a pas encore d’évaluation groupée active.',
    emptyTail: 'Votre coordinateur affecte les dimensions aux départements.',
    loadFailedTitle: 'Impossible de charger l’évaluation groupée',
    loadFailedBody: 'Le serveur est injoignable. Votre affectation existe peut-être toujours — vérifiez votre connexion et réessayez.',
    retry: 'Réessayer',
    back: '← Retour',
    eyebrow: 'Évaluation groupée',
    finalized: 'Finalisée',
    defaultTitle: 'Évaluation de la maturité des données',
    owns: (n, list) => `Votre département possède ${n} dimension${n > 1 ? 's' : ''} : ${list}. Les réponses sont enregistrées automatiquement.`,
    finalizedNote: 'Cette évaluation a été finalisée — vos réponses sont en lecture seule.',
    global: 'Score global', maturity: 'Maturité', level: (n) => `Niveau ${n}`,
  },
};

export default function GroupContributor() {
  const navigate = useNavigate();
  const { assessment, answers, loading, loadActive, saveAnswer, myAssignedDims } = useAssessmentStore();
  const loadError = useAssessmentStore(s => s.error);
  useAssessmentStore(s => s.assignments); // re-render when assignments load
  const refreshProfile = useAuthStore(s => s.refreshProfile);
  useAuthStore(s => s.departmentId); // re-derive assigned dims when profile resolves
  const c = COPY[useSettingsStore(s => s.language)] || COPY.en;

  const [navDim, setNavDim] = useState(null);
  const [navSub, setNavSub] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => { refreshProfile(); loadActive(); }, [refreshProfile, loadActive]);

  if (loading) return <p className="text-gray-400 py-32 text-center animate-pulse">{c.loading}</p>;

  // A failed load is NOT the same as "nothing assigned": show the failure and a
  // retry instead of the misleading empty state (which tells the analyst their
  // bank has no group assessment when in fact the request just didn't go through).
  if (loadError && !assessment) {
    return (
      <div className="max-w-xl mx-auto mt-10 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <div className="text-3xl mb-2">⚠️</div>
        <h1 className="text-lg font-semibold text-red-800">{c.loadFailedTitle}</h1>
        <p className="text-sm text-red-600 mt-1">{c.loadFailedBody}</p>
        <button onClick={() => loadActive()} className="mt-4 text-sm font-semibold text-red-700 border border-red-300 rounded-lg px-4 py-2 hover:bg-red-100">{c.retry}</button>
      </div>
    );
  }

  const myDims = assessment ? myAssignedDims() : [];
  const dims = Object.keys(DIMENSIONS).filter(d => myDims.includes(d));

  // Nothing assigned → clear empty state (not the assessment UI).
  if (dims.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-10 rounded-xl border border-gray-200 bg-white p-8 text-center">
        <div className="text-3xl mb-2">📋</div>
        <h1 className="text-lg font-semibold text-gray-800">{c.emptyTitle}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {assessment ? c.emptyWithAssessment : c.emptyNoAssessment} {c.emptyTail}
        </p>
        <button onClick={() => navigate('/')} className="mt-4 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50">{c.back}</button>
      </div>
    );
  }

  const readOnly = assessment.status !== 'draft';
  const myInds = INDICATORS.filter(i => dims.includes(i.dim));
  const dimOf = (id) => INDICATORS.find(i => i.id === id)?.dim;
  const isAnswered = (a) => !!(a && (a.skipped || (a.score !== null && a.score !== undefined)));

  // Server-backed write handlers (auto-save). Errors surface in the header.
  const save = async (id, patch) => {
    const { error } = await saveAnswer(id, dimOf(id), patch);
    if (error) setErr(error); else setErr(null);
  };

  // Scoring/helper adapters over the shared (server) answers — same maths as solo.
  const isCapped = (id) => {
    const a = answers[id];
    return !!(a && !a.skipped && a.score >= 3 && (!a.evidence || String(a.evidence).trim() === ''));
  };
  const dimStatus = (dim) => {
    const inds = INDICATORS.filter(i => i.dim === dim);
    const n = inds.filter(i => isAnswered(answers[i.id])).length;
    if (n === 0) return 'idle';
    return n === inds.length ? 'complete' : 'inprogress';
  };
  const complete = myInds.length > 0 && myInds.every(i => isAnswered(answers[i.id]));

  // Header: a slim group banner (draft) or the finalized read-only banner + scores.
  const sc = readOnly ? { g: globalFn(answers), m: matFn(globalFn(answers)) } : null;
  const header = (
    <div className="rounded-xl border border-ey-yellow bg-yellow-50 px-5 py-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-ey-charcoal/60">{c.eyebrow}</span>
        {readOnly && <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide bg-gray-200 text-gray-600">{c.finalized}</span>}
      </div>
      <div className="text-sm font-semibold text-gray-800">{assessment.title || c.defaultTitle}</div>
      {readOnly ? (
        <>
          <p className="text-xs text-gray-600 mt-0.5">{c.finalizedNote}</p>
          <div className="mt-2 flex items-center gap-6">
            <div><div className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{c.global}</div>
              <div className="text-xl font-bold font-mono text-ey-charcoal">{sc.g != null ? sc.g.toFixed(2) : '—'}<span className="text-xs text-gray-400">/5</span></div></div>
            <div><div className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{c.maturity}</div>
              <div className="text-base font-semibold text-gray-700">{sc.m ? c.level(sc.m) : '—'}</div></div>
          </div>
        </>
      ) : (
        <p className="text-xs text-gray-600 mt-0.5">{c.owns(dims.length, dims.map(d => `${d} ${DIMENSIONS[d].name}`).join(', '))}</p>
      )}
      {err && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 mt-2">{err}</p>}
    </div>
  );

  return (
    <AssessmentRunner
      mode="group"
      header={header}
      readOnly={readOnly}
      dims={dims}
      answers={answers}
      activeDimension={navDim}
      activeSubDim={navSub}
      onSelectDim={(dim) => { setNavDim(dim); setNavSub(DIMENSIONS[dim]?.subDims[0]); }}
      onSelectSub={setNavSub}
      onScore={(id, n) => save(id, { score: n, skipped: false })}
      onSkip={(id) => save(id, { skipped: true, score: null })}
      onUnskip={(id) => save(id, { skipped: false })}
      onEvidence={(id, text) => save(id, { evidence: text })}
      dimScore={(dim) => dimFn(answers, dim)}
      subDimScore={(sub) => subFn(answers, sub)}
      effectiveScore={(id) => effFn(answers[id])}
      isCapped={isCapped}
      skipCount={(dim) => INDICATORS.filter(i => i.dim === dim && answers[i.id]?.skipped).length}
      skipLimit={(dim) => Math.floor(INDICATORS.filter(i => i.dim === dim).length * 0.20)}
      cappedCount={() => myInds.filter(i => isCapped(i.id)).length}
      answeredCount={() => myInds.filter(i => isAnswered(answers[i.id])).length}
      dimStatus={dimStatus}
      totalIndicators={myInds.length}
      complete={complete}
    />
  );
}
