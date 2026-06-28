import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import useAuthStore from '../store/useAuthStore';
import useAssessmentStore from '../store/useAssessmentStore';
import useSettingsStore from '../store/useSettingsStore';
import LanguageToggle from '../components/ui/LanguageToggle';
import { INDICATORS, DIMENSIONS } from '../data/indicators';

// Role options. `v` is the stable value stored on the assessment (so the
// "Other" sentinel logic is language-independent); en/fr are display labels.
const ROLES = [
  { v: 'Chief Data Officer', en: 'Chief Data Officer', fr: 'Directeur des données (CDO)' },
  { v: 'IT Director', en: 'IT Director', fr: 'Directeur informatique (DSI)' },
  { v: 'Risk Manager', en: 'Risk Manager', fr: 'Responsable des risques' },
  { v: 'Data Analyst', en: 'Data Analyst', fr: 'Analyste de données' },
  { v: 'Compliance Officer', en: 'Compliance Officer', fr: 'Responsable conformité' },
  { v: 'Consultant', en: 'Consultant', fr: 'Consultant' },
  { v: 'Other', en: 'Other', fr: 'Autre' },
];

const TODAY = new Date().toISOString().slice(0, 10);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COPY = {
  en: {
    subtitle: 'Data Maturity Steering Tool',
    intro1a: 'DataPilot is a simple, guided check-up of how well your bank manages its data — what experts call its',
    intro1b: '“data maturity.”',
    intro1c: ' You answer a set of plain questions and the tool does the analysis for you: it scores your bank, shows where it stands against banking regulations, and gives you a step-by-step plan to improve.',
    intro2: 'No technical background needed — just answer honestly and follow the five steps below.',
    howItWorks: 'How it works',
    footer: 'EY Advisory Tunisia · PFE 2026 Internship Project',
    setupTitle: 'Set up your assessment',
    signOut: 'Sign out',
    setupSub: 'Confirm your details to begin. Your account email identifies this assessment session.',
    bankName: 'Bank name',
    bankUnset: 'Not set — ask your administrator',
    fromAccount: 'From your account',
    respondentName: 'Respondent name',
    fullNamePh: 'Full name',
    email: 'Email',
    signedIn: 'Signed in',
    roleFunction: 'Role / function',
    specifyRole: 'Please specify your role',
    assessmentDate: 'Assessment date',
    setAuto: 'Set automatically',
    start: 'Start Evaluation →',
    gEyebrow: 'Group assessment',
    gTitle: 'Your department has dimensions to fill',
    gAssigned: (list) => `You’ve been assigned ${list} on your bank’s shared assessment.`,
    gContribute: 'Contribute to the group assessment →',
    gOrSolo: '…or run a solo assessment below',
    soloEyebrow: 'Solo assessment',
    workflow: (nInd, nDim) => [
      { title: 'Sign in & set up', desc: "Tell us your bank's name and your role. There's nothing to install — this just puts your name on the report." },
      { title: 'Answer simple questions', desc: `Go through ${nInd} short questions about how your bank handles its data — how it's organised, kept accurate, protected and actually used. The questions are grouped into ${nDim} themes (we call them “dimensions”).` },
      { title: 'Get your score', desc: 'DataPilot instantly turns your answers into a maturity score from 1 (just getting started) to 5 (best-in-class), shown in easy-to-read charts so you can see your strong and weak areas at a glance.' },
      { title: 'See what to fix first', desc: 'It points out your biggest weak spots and builds a clear, prioritised to-do list — a practical action plan (with AI help) showing what to improve first for the fastest progress.' },
      { title: 'Check the rules & share', desc: "See whether your bank meets the Tunisian central bank's data rules (BCT) and international banking standards, then download a polished PDF report to share with management." },
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
    setupTitle: 'Configurer votre évaluation',
    signOut: 'Déconnexion',
    setupSub: 'Confirmez vos informations pour commencer. L’e-mail de votre compte identifie cette session d’évaluation.',
    bankName: 'Nom de la banque',
    bankUnset: 'Non défini — demandez à votre administrateur',
    fromAccount: 'Depuis votre compte',
    respondentName: 'Nom du répondant',
    fullNamePh: 'Nom complet',
    email: 'E-mail',
    signedIn: 'Connecté',
    roleFunction: 'Rôle / fonction',
    specifyRole: 'Veuillez préciser votre rôle',
    assessmentDate: 'Date de l’évaluation',
    setAuto: 'Définie automatiquement',
    start: 'Démarrer l’évaluation →',
    gEyebrow: 'Évaluation groupée',
    gTitle: 'Votre département a des dimensions à remplir',
    gAssigned: (list) => `Les dimensions ${list} vous ont été affectées sur l’évaluation partagée de votre banque.`,
    gContribute: 'Contribuer à l’évaluation groupée →',
    gOrSolo: '…ou réalisez une évaluation solo ci-dessous',
    soloEyebrow: 'Évaluation solo',
    workflow: (nInd, nDim) => [
      { title: 'Se connecter et configurer', desc: 'Indiquez le nom de votre banque et votre rôle. Rien à installer — cela inscrit simplement votre nom sur le rapport.' },
      { title: 'Répondre à des questions simples', desc: `Parcourez ${nInd} courtes questions sur la gestion des données de votre banque — leur organisation, leur exactitude, leur protection et leur utilisation. Les questions sont regroupées en ${nDim} thèmes (les « dimensions »).` },
      { title: 'Obtenir votre score', desc: 'DataPilot transforme instantanément vos réponses en un score de maturité de 1 (tout début) à 5 (meilleur de sa catégorie), affiché dans des graphiques clairs pour voir vos forces et faiblesses d’un coup d’œil.' },
      { title: 'Voir quoi corriger d’abord', desc: 'Il met en évidence vos points faibles et construit une liste d’actions priorisée — un plan d’action concret (assisté par IA) montrant quoi améliorer en premier pour progresser vite.' },
      { title: 'Vérifier les règles & partager', desc: 'Voyez si votre banque respecte les règles de la Banque Centrale de Tunisie (BCT) et les standards bancaires internationaux, puis téléchargez un rapport PDF soigné à partager avec la direction.' },
    ],
  },
};

export default function Welcome() {
  const navigate = useNavigate();
  const setProfile = useAppStore(s => s.setProfile);
  const authEmail = useAuthStore(s => s.user?.email) || '';
  const authBank = useAuthStore(s => s.bankName) || '';
  const signOut = useAuthStore(s => s.signOut);
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;

  // Group (Model B) assessment availability for this analyst.
  const loadActive = useAssessmentStore(s => s.loadActive);
  const groupAssessment = useAssessmentStore(s => s.assessment);
  useAssessmentStore(s => s.assignments); // re-render when assignments load
  const myAssignedDims = useAssessmentStore(s => s.myAssignedDims);
  const refreshProfile = useAuthStore(s => s.refreshProfile);
  // Refresh profile (department may have just been assigned) + load the bank's
  // assessment, so the Contribute card appears without a re-login.
  useEffect(() => { refreshProfile(); loadActive(); }, [refreshProfile, loadActive]);
  const groupDims = (groupAssessment && groupAssessment.status === 'draft') ? myAssignedDims() : [];

  const WORKFLOW = c.workflow(INDICATORS.length, Object.keys(DIMENSIONS).length);
  const formattedToday = new Date(TODAY).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  const [form, setForm] = useState({ date: TODAY, respondentName: '', role: ROLES[0].v, email: authEmail });
  const [customRole, setCustomRole] = useState('');

  const isOther = form.role === 'Other';
  const effectiveRole = isOther ? customRole.trim() : form.role;
  const emailValid = EMAIL_RE.test(form.email.trim());
  const canStart = form.respondentName.trim() && effectiveRole && emailValid;

  function handleStart() {
    if (!canStart) return;
    setProfile({ ...form, bankName: authBank, role: effectiveRole, date: TODAY, email: form.email.trim() });
    navigate('/assessment');
  }

  return (
    <div className="flex min-h-screen relative">
      {/* Language switch — always available. */}
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

          {/* How it works — numbered workflow */}
          <div className="mt-8">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-ey-yellow mb-4">{c.howItWorks}</div>
            <div className="flex flex-col">
              {WORKFLOW.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-ey-yellow text-ey-charcoal text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </div>
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

      {/* Right panel — sign-in / profile form */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-10">
        <div className="w-full max-w-md flex flex-col gap-4">
          {/* Group assessment invitation — only when a dimension is assigned to
              the analyst's department on an active draft. Solo stays available. */}
          {groupDims.length > 0 && (
            <div className="bg-white rounded-xl border-2 border-ey-yellow p-5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-ey-charcoal/60">{c.gEyebrow}</div>
              <h3 className="text-base font-semibold text-gray-800 mt-0.5">{c.gTitle}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {c.gAssigned(groupDims.map(d => `${d} · ${DIMENSIONS[d].name}`).join(', '))}
              </p>
              <button
                onClick={() => navigate('/group')}
                className="mt-3 w-full bg-ey-charcoal text-ey-yellow font-semibold rounded-lg py-2.5 text-sm hover:bg-gray-800"
              >
                {c.gContribute}
              </button>
              <div className="text-[11px] text-gray-400 text-center mt-2">{c.gOrSolo}</div>
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          {groupDims.length > 0 && (
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{c.soloEyebrow}</div>
          )}
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-xl font-semibold text-gray-800">{c.setupTitle}</h2>
            <button
              onClick={handleSignOut}
              className="text-xs font-medium text-gray-400 hover:text-gray-700 flex-shrink-0 mt-1"
            >
              {c.signOut}
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-6">{c.setupSub}</p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{c.bankName}</label>
              <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
                <span>{authBank || c.bankUnset}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">{c.fromAccount}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{c.respondentName}</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow focus:border-transparent"
                placeholder={c.fullNamePh}
                value={form.respondentName}
                onChange={e => setForm(f => ({ ...f, respondentName: e.target.value }))}
              />
            </div>

            {/* Email — taken from the signed-in account, shown read-only. */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{c.email}</label>
              <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
                <span>{form.email}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">{c.signedIn}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{c.roleFunction}</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow focus:border-transparent bg-white"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              >
                {ROLES.map(r => <option key={r.v} value={r.v}>{r[lang] || r.en}</option>)}
              </select>

              {/* Free-text role shown only when "Other" is selected. */}
              {isOther && (
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-ey-yellow focus:border-transparent"
                  placeholder={c.specifyRole}
                  value={customRole}
                  onChange={e => setCustomRole(e.target.value)}
                  autoFocus
                />
              )}
            </div>

            {/* Assessment date — captured automatically, read-only */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{c.assessmentDate}</label>
              <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
                <span>{formattedToday}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">{c.setAuto}</span>
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={!canStart}
              className="mt-2 w-full bg-ey-yellow text-ey-charcoal font-semibold rounded-lg py-3 text-sm hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
