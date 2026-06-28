import { useEffect, useState } from 'react';
import useSubmissionsStore from '../../store/useSubmissionsStore';
import useSettingsStore from '../../store/useSettingsStore';
import { DIMENSIONS, INDICATORS } from '../../data/indicators';
import { MATURITY_LEVELS } from '../../store/useAppStore';

const COPY = {
  en: {
    loadingSubmission: 'Loading submission…',
    untitledBank: 'Untitled bank',
    submittedBy: (email, date) => `Submitted by ${email} · ${date}`,
    respondent: (name) => `Respondent: ${name}`,
    assessmentDated: (date) => ` · assessment dated ${date}`,
    backToList: '← Back to list',
    globalMaturity: 'Global maturity',
    noScore: 'No score',
    scoreDetail: (score, level, cmmi) => `${score} / 5 · Level ${level} — ${cmmi}`,
    bctCompliance: 'BCT compliance',
    targetLevel: (lvl) => `Target level ${lvl}`,
    indicatorsAnswered: 'Indicators answered',
    dimensionScores: 'Dimension scores',
    allAnswers: (n) => `All indicator answers (${n})`,
    colIndicator: 'Indicator',
    colScore: 'Score',
    colEvidence: 'Evidence',
    skipped: 'skipped',
    title: 'Submissions',
    intro: 'Completed assessments analysts have sent in for review. Open one to see the full scoring and answers.',
    refresh: '↻ Refresh',
    colBank: 'Bank',
    colAnalyst: 'Analyst',
    colMaturity: 'Maturity',
    colBct: 'BCT',
    colSubmitted: 'Submitted',
    loading: 'Loading…',
    noSubmissions: 'No submissions yet.',
    delete: 'Delete',
    confirmDelete: 'Delete this submission? This cannot be undone.',
  },
  fr: {
    loadingSubmission: 'Chargement de l’évaluation…',
    untitledBank: 'Banque sans nom',
    submittedBy: (email, date) => `Soumis par ${email} · ${date}`,
    respondent: (name) => `Répondant : ${name}`,
    assessmentDated: (date) => ` · évaluation datée du ${date}`,
    backToList: '← Retour à la liste',
    globalMaturity: 'Maturité globale',
    noScore: 'Aucun score',
    scoreDetail: (score, level, cmmi) => `${score} / 5 · Niveau ${level} — ${cmmi}`,
    bctCompliance: 'Conformité BCT',
    targetLevel: (lvl) => `Niveau cible ${lvl}`,
    indicatorsAnswered: 'Indicateurs renseignés',
    dimensionScores: 'Scores par dimension',
    allAnswers: (n) => `Toutes les réponses aux indicateurs (${n})`,
    colIndicator: 'Indicateur',
    colScore: 'Score',
    colEvidence: 'Preuve',
    skipped: 'ignoré',
    title: 'Évaluations',
    intro: 'Évaluations terminées soumises par les analystes pour examen. Ouvrez-en une pour voir le scoring complet et les réponses.',
    refresh: '↻ Actualiser',
    colBank: 'Banque',
    colAnalyst: 'Analyste',
    colMaturity: 'Maturité',
    colBct: 'BCT',
    colSubmitted: 'Soumis le',
    loading: 'Chargement…',
    noSubmissions: 'Aucune évaluation pour le moment.',
    delete: 'Supprimer',
    confirmDelete: 'Supprimer cette évaluation ? Cette action est irréversible.',
  },
};

function levelFor(score) {
  if (score === null || score === undefined) return null;
  return MATURITY_LEVELS.find(l => score >= l.min && score <= l.max) || MATURITY_LEVELS[4];
}

function fmtDate(ts, lang) {
  return ts ? new Date(ts).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
}

// Read-only review of a single submission: headline scores, per-dimension
// breakdown, and the full indicator-by-indicator answers as captured.
function SubmissionDetail({ id, onClose }) {
  const getSubmission = useSubmissionsStore(s => s.getSubmission);
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;
  const [row, setRow] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    getSubmission(id).then(({ data, error: err }) => {
      if (!alive) return;
      if (err) setError(err);
      else setRow(data);
    });
    return () => { alive = false; };
  }, [id, getSubmission]);

  if (error) {
    return <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>;
  }
  if (!row) return <p className="text-sm text-gray-400">{c.loadingSubmission}</p>;

  const lvl = levelFor(row.global_score);
  const answers = row.answers || {};

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{row.bank_name || c.untitledBank}</h3>
          <p className="text-sm text-gray-500">
            {c.submittedBy(row.analyst_email || '—', fmtDate(row.created_at, lang))}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {c.respondent(row.respondent_name || '—')}
            {row.respondent_role ? ` (${row.respondent_role})` : ''}
            {row.assessment_date ? c.assessmentDated(row.assessment_date) : ''}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-medium text-gray-600 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50"
        >
          {c.backToList}
        </button>
      </div>

      {/* Headline KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-lg border border-gray-200 p-3">
          <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">{c.globalMaturity}</div>
          {row.global_score !== null && row.global_score !== undefined ? (
            <>
              <div className="text-2xl font-bold tabular-nums" style={{ color: lvl?.color }}>
                {Math.round(row.global_score * 20)}%
              </div>
              <div className="text-xs text-gray-500">
                {c.scoreDetail(row.global_score.toFixed(2), lvl?.level, lvl?.cmmi)}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-400">{c.noScore}</div>
          )}
        </div>
        <div className="rounded-lg border border-gray-200 p-3">
          <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">{c.bctCompliance}</div>
          <div className="text-2xl font-bold tabular-nums text-gray-800">{row.bct_rate ?? 0}%</div>
          <div className="text-xs text-gray-500">{c.targetLevel(row.target_level ?? '—')}</div>
        </div>
        <div className="rounded-lg border border-gray-200 p-3">
          <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">{c.indicatorsAnswered}</div>
          <div className="text-2xl font-bold tabular-nums text-gray-800">
            {Object.values(answers).filter(a => a && (a.skipped || a.score != null)).length} / {INDICATORS.length}
          </div>
        </div>
      </div>

      {/* Per-dimension scores */}
      <div className="mb-5">
        <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-2">{c.dimensionScores}</div>
        <div className="flex flex-col gap-2">
          {Object.entries(DIMENSIONS).map(([key, d]) => {
            const score = row.dimension_scores?.[key];
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-sm text-gray-700 flex-1">{d.name}</span>
                <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${((score ?? 0) / 5) * 100}%`, background: d.color }} />
                </div>
                <span className="text-sm font-bold tabular-nums w-12 text-right" style={{ color: d.color }}>
                  {score != null ? score.toFixed(2) : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full answers */}
      <details>
        <summary className="text-sm font-medium text-gray-600 cursor-pointer select-none">
          {c.allAnswers(INDICATORS.length)}
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wide">
              <tr>
                <th className="text-left font-semibold px-3 py-2">{c.colIndicator}</th>
                <th className="text-left font-semibold px-3 py-2">{c.colScore}</th>
                <th className="text-left font-semibold px-3 py-2">{c.colEvidence}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {INDICATORS.map(ind => {
                const a = answers[ind.id] || {};
                return (
                  <tr key={ind.id}>
                    <td className="px-3 py-2 text-gray-700 leading-snug">
                      <span className="font-mono text-gray-400 mr-1">{ind.id}</span>
                      {ind.q}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {a.skipped ? (
                        <span className="text-gray-400 italic">{c.skipped}</span>
                      ) : a.score != null ? (
                        <span className="font-semibold text-gray-800">{a.score}/5</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-500 italic">
                      {a.evidence ? a.evidence : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

// Submissions review surface. Admins and super-admins see every analyst's
// submitted assessment (RLS-scoped) and can open one for a full read-only review.
export default function AdminSubmissions() {
  const { submissions, loading, error, listSubmissions, deleteSubmission } = useSubmissionsStore();
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;
  const [openId, setOpenId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    listSubmissions();
  }, [listSubmissions]);

  async function handleDelete(id) {
    if (!window.confirm(c.confirmDelete)) return;
    setBusyId(id);
    await deleteSubmission(id);
    setBusyId(null);
    if (openId === id) setOpenId(null);
  }

  if (openId) {
    return <SubmissionDetail id={openId} onClose={() => setOpenId(null)} />;
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{c.title}</h2>
          <p className="text-sm text-gray-500">
            {c.intro}
          </p>
        </div>
        <button
          onClick={listSubmissions}
          className="text-xs font-medium text-gray-600 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50"
        >
          {c.refresh}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>
      )}

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-semibold px-4 py-2.5">{c.colBank}</th>
              <th className="text-left font-semibold px-4 py-2.5">{c.colAnalyst}</th>
              <th className="text-left font-semibold px-4 py-2.5">{c.colMaturity}</th>
              <th className="text-left font-semibold px-4 py-2.5">{c.colBct}</th>
              <th className="text-left font-semibold px-4 py-2.5">{c.colSubmitted}</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">{c.loading}</td></tr>
            )}
            {!loading && submissions.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">{c.noSubmissions}</td></tr>
            )}
            {submissions.map(s => {
              const lvl = levelFor(s.global_score);
              return (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setOpenId(s.id)}
                      className="font-medium text-ey-charcoal hover:underline text-left"
                    >
                      {s.bank_name || c.untitledBank}
                    </button>
                    {s.respondent_name && (
                      <div className="text-xs text-gray-400">{s.respondent_name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.analyst_email || '—'}</td>
                  <td className="px-4 py-3">
                    {s.global_score != null ? (
                      <span className="font-semibold" style={{ color: lvl?.color }}>
                        {Math.round(s.global_score * 20)}%
                        <span className="text-gray-400 font-normal ml-1">L{lvl?.level}</span>
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.bct_rate ?? 0}%</td>
                  <td className="px-4 py-3 text-gray-500">{fmtDate(s.created_at, lang)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={busyId === s.id}
                      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
                    >
                      {c.delete}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
