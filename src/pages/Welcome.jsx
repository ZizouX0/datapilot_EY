import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import useAuthStore from '../store/useAuthStore';
import useAssessmentStore from '../store/useAssessmentStore';
import useSettingsStore from '../store/useSettingsStore';
import LanguageToggle from '../components/ui/LanguageToggle';
import { INDICATORS, DIMENSIONS } from '../data/indicators';

const TODAY = new Date().toISOString().slice(0, 10);

const COPY = {
  en: {
    subtitle: 'Data Maturity Steering Tool',
    intro1a: 'DataPilot is a simple, guided check-up of how well your bank manages its data — what experts call its',
    intro1b: '“data maturity.”',
    intro1c: ' You answer a set of plain questions and the tool does the analysis for you: it scores your bank, shows where it stands against banking regulations, and gives you a step-by-step plan to improve.',
    intro2: 'No technical background needed — just answer honestly and follow the five steps below.',
    howItWorks: 'How it works',
    footer: 'EY Advisory Tunisia · PFE 2026 Internship Project',
    setupTitle: 'Start your assessment',
    signOut: 'Sign out',
    setupSub: 'These details come from your account — confirm and begin. Your name is editable on your Account page; your function is set by your administrator.',
    name: 'Name',
    email: 'Email',
    roleFunction: 'Role / function',
    bankName: 'Bank',
    assessmentDate: 'Assessment date',
    fromAccount: 'From your account',
    signedIn: 'Signed in',
    setAuto: 'Set automatically',
    bankUnset: 'Not set — ask your administrator',
    functionUnset: 'Not set — ask your administrator',
    start: 'Start Assessment →',
    gEyebrow: 'Group assessment',
    gTitle: 'Your department has dimensions to fill',
    gReviewTitle: 'Your group assessment is finalized',
    gAssigned: (list) => `You’ve been assigned ${list} on your bank’s shared assessment.`,
    gContribute: 'Contribute to the group assessment →',
    gReview: 'Review the group assessment →',
    gOrSolo: '…or run a solo assessment below',
    soloEyebrow: 'Solo assessment',
    workflow: (nInd, nDim) => [
      { title: 'Sign in & set up', desc: "Your details come straight from your account — there's nothing to type." },
      { title: 'Answer simple questions', desc: `Go through ${nInd} short questions about how your bank handles its data, grouped into ${nDim} clear themes.` },
      { title: 'Get your score', desc: 'DataPilot turns your answers into a 1–5 maturity score with easy-to-read charts.' },
      { title: 'See what to fix first', desc: 'A prioritised, AI-assisted action plan shows what to improve first.' },
      { title: 'Check the rules & share', desc: 'See BCT and international compliance, then export a polished PDF report.' },
    ],
  },
  fr: {
    subtitle: 'Outil de pilotage de la maturité des données',
    intro1a: 'DataPilot est un bilan simple et guidé de la façon dont votre banque gère ses données — ce que les experts appellent sa',
    intro1b: '« maturité des données ».',
    intro1c: ' Vous répondez à des questions simples et l’outil fait l’analyse pour vous : il note votre banque, montre où elle se situe par rapport à la réglementation bancaire et vous propose un plan d’amélioration étape par étape.',
    intro2: 'Aucune compétence technique requise — répondez honnêtement et suivez les cinq étapes ci-dessous.',
    howItWorks: 'Comment ça marche',
    footer: 'EY Advisory Tunisie · Projet de stage PFE 2026',
    setupTitle: 'Démarrer votre évaluation',
    signOut: 'Déconnexion',
    setupSub: 'Ces informations proviennent de votre compte — confirmez et commencez. Votre nom est modifiable depuis votre page Compte ; votre fonction est définie par votre administrateur.',
    name: 'Nom',
    email: 'E-mail',
    roleFunction: 'Rôle / fonction',
    bankName: 'Banque',
    assessmentDate: 'Date de l’évaluation',
    fromAccount: 'Depuis votre compte',
    signedIn: 'Connecté',
    setAuto: 'Définie automatiquement',
    bankUnset: 'Non défini — demandez à votre administrateur',
    functionUnset: 'Non définie — demandez à votre administrateur',
    start: 'Démarrer l’évaluation →',
    gEyebrow: 'Évaluation groupée',
    gTitle: 'Votre département a des dimensions à remplir',
    gReviewTitle: 'Votre évaluation groupée est finalisée',
    gAssigned: (list) => `Les dimensions ${list} vous ont été affectées sur l’évaluation partagée de votre banque.`,
    gContribute: 'Contribuer à l’évaluation groupée →',
    gReview: 'Consulter l’évaluation groupée →',
    gOrSolo: '…ou réalisez une évaluation solo ci-dessous',
    soloEyebrow: 'Évaluation solo',
    workflow: (nInd, nDim) => [
      { title: 'Se connecter et configurer', desc: 'Vos informations proviennent directement de votre compte — rien à saisir.' },
      { title: 'Répondre à des questions simples', desc: `Parcourez ${nInd} courtes questions sur la gestion des données de votre banque, regroupées en ${nDim} thèmes clairs.` },
      { title: 'Obtenir votre score', desc: 'DataPilot transforme vos réponses en un score de maturité de 1 à 5 avec des graphiques clairs.' },
      { title: 'Voir quoi corriger d’abord', desc: 'Un plan d’action priorisé, assisté par IA, montre quoi améliorer en premier.' },
      { title: 'Vérifier les règles & partager', desc: 'Consultez la conformité BCT et internationale, puis exportez un rapport PDF soigné.' },
    ],
  },
};

// One read-only field row (value comes from the account).
function Field({ label, value, chip }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center justify-between gap-2">
        <span className="truncate">{value}</span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wide flex-shrink-0">{chip}</span>
      </div>
    </div>
  );
}

export default function Welcome() {
  const navigate = useNavigate();
  const setProfile = useAppStore(s => s.setProfile);
  const authEmail = useAuthStore(s => s.user?.email) || '';
  const authBank = useAuthStore(s => s.bankName) || '';
  const fullName = useAuthStore(s => s.fullName) || '';
  const title = useAuthStore(s => s.title) || '';
  const signOut = useAuthStore(s => s.signOut);
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;

  // Group (Model B) assessment availability for this analyst.
  const loadActive = useAssessmentStore(s => s.loadActive);
  const groupAssessment = useAssessmentStore(s => s.assessment);
  useAssessmentStore(s => s.assignments); // re-render when assignments load
  const myAssignedDims = useAssessmentStore(s => s.myAssignedDims);
  const refreshProfile = useAuthStore(s => s.refreshProfile);
  useEffect(() => { refreshProfile(); loadActive(); }, [refreshProfile, loadActive]);
  const groupFinalized = groupAssessment?.status === 'finalized';
  const groupDims = groupAssessment ? myAssignedDims() : [];

  const WORKFLOW = c.workflow(INDICATORS.length, Object.keys(DIMENSIONS).length);
  const formattedToday = new Date(TODAY).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  // The assessment identity comes entirely from the account — no re-entry.
  function handleStart() {
    setProfile({
      bankName: authBank,
      respondentName: fullName || authEmail,
      role: title || '',
      email: authEmail,
      date: TODAY,
    });
    navigate('/assessment');
  }

  return (
    <div className="flex min-h-screen relative">
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle variant="light" />
      </div>

      {/* Left panel — branding + plain-language workflow */}
      <div className="w-[42%] min-w-[360px] bg-ey-charcoal flex flex-col justify-between p-12">
        <div>
          <div className="text-6xl font-bold text-ey-yellow leading-none">EY</div>
          <div className="w-16 h-1 bg-ey-yellow my-4" />
          <div className="text-3xl font-light text-white">DataPilot</div>
          <div className="text-gray-400 text-sm mt-1">{c.subtitle}</div>

          <p className="text-sm text-gray-300 leading-relaxed mt-6 max-w-sm">
            {c.intro1a} <span className="text-white font-medium">{c.intro1b}</span>{c.intro1c}
          </p>
          <p className="text-xs text-gray-400 leading-relaxed mt-3 max-w-sm">{c.intro2}</p>

          <div className="mt-8">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-ey-yellow mb-4">{c.howItWorks}</div>
            <div className="flex flex-col">
              {WORKFLOW.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-ey-yellow text-ey-charcoal text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
                    {i < WORKFLOW.length - 1 && <div className="w-px flex-1 bg-gray-600 my-1" />}
                  </div>
                  <div className={i < WORKFLOW.length - 1 ? 'pb-4' : ''}>
                    <div className="text-sm font-semibold text-white leading-tight">{step.title}</div>
                    <div className="text-xs text-gray-400 leading-snug mt-0.5">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-gray-500 text-xs mt-8">{c.footer}</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-10">
        <div className="w-full max-w-md flex flex-col gap-4">
          {/* Group assessment card — when a dimension is assigned (draft or finalized). */}
          {groupDims.length > 0 && (
            <div className="bg-white rounded-xl border-2 border-ey-yellow p-5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-ey-charcoal/60">{c.gEyebrow}</div>
              <h3 className="text-base font-semibold text-gray-800 mt-0.5">{groupFinalized ? c.gReviewTitle : c.gTitle}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {c.gAssigned(groupDims.map(d => `${d} · ${DIMENSIONS[d].name}`).join(', '))}
              </p>
              <button
                onClick={() => navigate('/group')}
                className="mt-3 w-full bg-ey-charcoal text-ey-yellow font-semibold rounded-lg py-2.5 text-sm hover:bg-gray-800"
              >
                {groupFinalized ? c.gReview : c.gContribute}
              </button>
              <div className="text-[11px] text-gray-400 text-center mt-2">{c.gOrSolo}</div>
            </div>
          )}

          {/* Solo assessment — read-only confirmation from the account, then Start. */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            {groupDims.length > 0 && (
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{c.soloEyebrow}</div>
            )}
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-xl font-semibold text-gray-800">{c.setupTitle}</h2>
              <button onClick={handleSignOut} className="text-xs font-medium text-gray-400 hover:text-gray-700 flex-shrink-0 mt-1">{c.signOut}</button>
            </div>
            <p className="text-sm text-gray-500 mb-6">{c.setupSub}</p>

            <div className="flex flex-col gap-4">
              <Field label={c.name} value={fullName || authEmail} chip={c.fromAccount} />
              <Field label={c.email} value={authEmail} chip={c.signedIn} />
              <Field
                label={c.roleFunction}
                value={title || <span className="text-gray-400 italic">{c.functionUnset}</span>}
                chip={c.fromAccount}
              />
              <Field
                label={c.bankName}
                value={authBank || <span className="text-gray-400 italic">{c.bankUnset}</span>}
                chip={c.fromAccount}
              />
              <Field label={c.assessmentDate} value={formattedToday} chip={c.setAuto} />

              <button
                onClick={handleStart}
                className="mt-2 w-full bg-ey-yellow text-ey-charcoal font-semibold rounded-lg py-3 text-sm hover:bg-yellow-400 transition-colors"
              >
                {c.start}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
