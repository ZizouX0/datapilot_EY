import { Link } from 'react-router-dom';
import { INDICATORS, DIMENSIONS } from '../data/indicators';
import useSettingsStore from '../store/useSettingsStore';
import LanguageToggle from '../components/ui/LanguageToggle';

// Public landing page — the first thing anyone sees. It leads with WHAT
// DataPilot is and WHY it is credible (the frameworks it is built on and the
// safeguards that keep its scores honest), so a visitor trusts the tool before
// signing in. Sign-in itself is kept deliberately small and secondary.
const COPY = {
  en: {
    signIn: 'Sign in',
    heroTitlePre: 'How well does your bank ',
    heroTitleEm: 'manage its data?',
    heroBody: 'DataPilot is a rigorous, guided assessment of your bank’s data maturity — how well it governs, protects and uses its data. You answer plain questions; the tool does the analysis, scores your bank against established frameworks, checks it against banking regulation, and builds a step-by-step plan to improve.',
    stat1: (n) => `★ ${n} indicators`,
    stat2: (n) => `★ ${n} weighted dimensions`,
    stat3: '★ CMMI · Gartner · BCT aligned',
    fwEyebrow: 'Built on recognised frameworks',
    fwHeading: 'Not a questionnaire with a gut-feel score — a method grounded in the standards banks already trust.',
    dimsHeading: (n) => `The ${n} dimensions and how much each counts`,
    howEyebrow: 'How it works',
    trustEyebrow: 'Why you can trust the result',
    trustHeading: 'Safeguards that keep every score honest and defensible.',
    ctaTitle: 'Ready to begin?',
    ctaBody: 'Use the email where you received your invite — accounts are created by your administrator.',
    ctaButton: 'Sign in to get started →',
    footer: 'EY Advisory Tunisia · PFE 2026 Internship Project',
    steps: [
      { title: 'Sign in', desc: 'Your administrator gives you an account — nothing to install.' },
      { title: 'Answer simple questions', desc: `Go through ${INDICATORS.length} short questions about how your bank handles its data, grouped into ${Object.keys(DIMENSIONS).length} clear themes.` },
      { title: 'Get your score', desc: 'Answers become a 1–5 maturity score with easy-to-read charts.' },
      { title: 'See what to fix first', desc: 'A prioritised, AI-assisted action plan shows what to improve first.' },
      { title: 'Check the rules & share', desc: 'See BCT and international compliance, then export a polished PDF report.' },
    ],
    frameworks: [
      { tag: 'CMMI', title: 'Capability Maturity Model', desc: 'The internationally recognised 5-level scale — Initial → Optimized — used to rate each capability objectively rather than by opinion.' },
      { tag: 'Gartner', title: 'Data & Analytics Maturity', desc: 'Gartner’s maturity stages (Unaware → Transformative) frame exactly where the bank stands on its data journey.' },
      { tag: 'BCT', title: 'Banque Centrale de Tunisie', desc: 'Key indicators map to BCT regulatory data expectations, so compliance is measured and reported — not assumed.' },
      { tag: 'Method', title: 'Weighted multi-dimension model', desc: 'A transparent weighted formula across the dimensions produces one defensible global score, fully shown in the report.' },
    ],
    trust: [
      { icon: '🎯', title: 'Evidence-based scoring', desc: 'A high score with no documented evidence is automatically capped — results reflect reality, not optimism.' },
      { icon: '🏦', title: 'Regulatory by design', desc: 'BCT-critical indicators cannot be skipped, and a compliance rate is computed for every assessment.' },
      { icon: '⚖️', title: 'Transparent weighting', desc: 'Each dimension’s contribution to the score is explicit and shown in the report — nothing is a black box.' },
      { icon: '🤝', title: 'Built for real org charts', desc: 'Departments can each own the dimensions they know best, then a coordinator consolidates one shared result.' },
    ],
  },
  fr: {
    signIn: 'Se connecter',
    heroTitlePre: 'Votre banque gère-t-elle bien ',
    heroTitleEm: 'ses données ?',
    heroBody: 'DataPilot est une évaluation rigoureuse et guidée de la maturité des données de votre banque — sa façon de gouverner, protéger et exploiter ses données. Vous répondez à des questions simples ; l’outil fait l’analyse, note votre banque selon des référentiels reconnus, vérifie la conformité réglementaire bancaire et construit un plan d’amélioration étape par étape.',
    stat1: (n) => `★ ${n} indicateurs`,
    stat2: (n) => `★ ${n} dimensions pondérées`,
    stat3: '★ Aligné CMMI · Gartner · BCT',
    fwEyebrow: 'Fondé sur des référentiels reconnus',
    fwHeading: 'Pas un questionnaire avec un score au feeling — une méthode ancrée dans les standards auxquels les banques font déjà confiance.',
    dimsHeading: (n) => `Les ${n} dimensions et le poids de chacune`,
    howEyebrow: 'Comment ça marche',
    trustEyebrow: 'Pourquoi vous pouvez faire confiance au résultat',
    trustHeading: 'Des garde-fous qui rendent chaque score honnête et défendable.',
    ctaTitle: 'Prêt à commencer ?',
    ctaBody: 'Utilisez l’e-mail sur lequel vous avez reçu votre invitation — les comptes sont créés par votre administrateur.',
    ctaButton: 'Se connecter pour commencer →',
    footer: 'EY Advisory Tunisie · Projet de stage PFE 2026',
    steps: [
      { title: 'Se connecter', desc: 'Votre administrateur vous donne un compte — rien à installer.' },
      { title: 'Répondre à des questions simples', desc: `Parcourez ${INDICATORS.length} courtes questions sur la gestion des données de votre banque, regroupées en ${Object.keys(DIMENSIONS).length} thèmes clairs.` },
      { title: 'Obtenir votre score', desc: 'Les réponses deviennent un score de maturité de 1 à 5 avec des graphiques clairs.' },
      { title: 'Voir quoi corriger d’abord', desc: 'Un plan d’action priorisé, assisté par IA, montre quoi améliorer en premier.' },
      { title: 'Vérifier les règles & partager', desc: 'Consultez la conformité BCT et internationale, puis exportez un rapport PDF soigné.' },
    ],
    frameworks: [
      { tag: 'CMMI', title: 'Modèle de maturité des capacités', desc: 'L’échelle à 5 niveaux reconnue mondialement — Initial → Optimisé — pour noter chaque capacité de façon objective plutôt que par opinion.' },
      { tag: 'Gartner', title: 'Maturité Data & Analytics', desc: 'Les stades de maturité de Gartner (Inconscient → Transformatif) situent précisément la banque dans son parcours data.' },
      { tag: 'BCT', title: 'Banque Centrale de Tunisie', desc: 'Les indicateurs clés correspondent aux attentes réglementaires de la BCT : la conformité est mesurée et rapportée, pas supposée.' },
      { tag: 'Méthode', title: 'Modèle multidimensionnel pondéré', desc: 'Une formule pondérée transparente sur les dimensions produit un score global défendable, entièrement détaillé dans le rapport.' },
    ],
    trust: [
      { icon: '🎯', title: 'Notation fondée sur la preuve', desc: 'Un score élevé sans preuve documentée est automatiquement plafonné — les résultats reflètent la réalité, pas l’optimisme.' },
      { icon: '🏦', title: 'Réglementaire par conception', desc: 'Les indicateurs critiques BCT ne peuvent être ignorés, et un taux de conformité est calculé pour chaque évaluation.' },
      { icon: '⚖️', title: 'Pondération transparente', desc: 'La contribution de chaque dimension au score est explicite et affichée dans le rapport — aucune boîte noire.' },
      { icon: '🤝', title: 'Pensé pour de vrais organigrammes', desc: 'Chaque département peut posséder les dimensions qu’il connaît le mieux, puis un coordinateur consolide un résultat partagé.' },
    ],
  },
};

export default function Landing() {
  const dims = Object.entries(DIMENSIONS);
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;

  return (
    <div className="min-h-screen bg-white">
      {/* Slim top bar — logo left, language + small secondary sign-in right. */}
      <header className="sticky top-0 z-20 bg-ey-charcoal text-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-2.5">
            <span className="bg-ey-yellow text-ey-charcoal font-bold px-2 py-0.5 rounded text-sm leading-none">EY</span>
            <span className="text-lg font-light">DataPilot</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle variant="dark" />
            <Link
              to="/login"
              className="text-sm font-semibold border border-gray-500 hover:border-ey-yellow hover:text-ey-yellow text-gray-200 rounded-lg px-4 py-1.5 transition-colors"
            >
              {c.signIn}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — the message is the star. */}
      <section className="bg-ey-charcoal text-white">
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-16 lg:pt-16 lg:pb-24">
          <div className="w-16 h-1 bg-ey-yellow mb-6" />
          <h1 className="text-3xl lg:text-5xl font-light leading-tight max-w-3xl">
            {c.heroTitlePre}<span className="text-ey-yellow">{c.heroTitleEm}</span>
          </h1>
          <p className="text-gray-300 leading-relaxed mt-6 max-w-2xl text-lg">{c.heroBody}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-400">
            <span>{c.stat1(INDICATORS.length)}</span>
            <span>{c.stat2(dims.length)}</span>
            <span>{c.stat3}</span>
          </div>
        </div>
      </section>

      {/* Built on recognised frameworks — the credibility section. */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-ey-purple mb-2">{c.fwEyebrow}</div>
        <h2 className="text-2xl font-light text-gray-800 max-w-2xl">{c.fwHeading}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {c.frameworks.map(f => (
            <div key={f.tag} className="rounded-xl border border-gray-200 p-5 hover:border-ey-yellow transition-colors">
              <span className="inline-block bg-ey-charcoal text-ey-yellow text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded">{f.tag}</span>
              <div className="text-sm font-semibold text-gray-800 mt-3">{f.title}</div>
              <p className="text-sm text-gray-500 mt-1 leading-snug">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* The dimensions + weights — concrete proof of the method. */}
        <div className="mt-8 rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {c.dimsHeading(dims.length)}
          </div>
          <div className="divide-y divide-gray-100">
            {dims.map(([code, d]) => (
              <div key={code} className="flex items-center gap-3 px-5 py-2.5">
                <span className="text-sm font-bold w-8" style={{ color: d.color }}>{code}</span>
                <span className="text-sm text-gray-700 flex-1">{d.name}</span>
                <div className="w-40 h-2 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                  <div className="h-full rounded-full" style={{ width: `${Math.round(d.weight * 100)}%`, background: d.color }} />
                </div>
                <span className="text-sm font-semibold text-gray-600 w-12 text-right">{Math.round(d.weight * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works. */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-ey-purple mb-6">{c.howEyebrow}</div>
          <div className="grid md:grid-cols-5 gap-4">
            {c.steps.map((step, i) => (
              <div key={step.title} className="rounded-xl bg-white border border-gray-200 p-4">
                <div className="w-8 h-8 rounded-full bg-ey-charcoal text-ey-yellow text-sm font-bold flex items-center justify-center">{i + 1}</div>
                <div className="text-sm font-semibold text-gray-800 mt-3">{step.title}</div>
                <p className="text-xs text-gray-500 mt-1 leading-snug">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why you can trust the result. */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-ey-purple mb-2">{c.trustEyebrow}</div>
        <h2 className="text-2xl font-light text-gray-800 max-w-2xl">{c.trustHeading}</h2>
        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          {c.trust.map(tr => (
            <div key={tr.title} className="flex gap-4 rounded-xl border border-gray-200 p-5">
              <div className="text-2xl flex-shrink-0">{tr.icon}</div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{tr.title}</div>
                <p className="text-sm text-gray-500 mt-0.5 leading-snug">{tr.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modest closing sign-in. */}
      <section className="bg-ey-charcoal text-white">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-lg font-medium">{c.ctaTitle}</div>
            <p className="text-sm text-gray-400">{c.ctaBody}</p>
          </div>
          <Link
            to="/login"
            className="bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-6 py-2.5 text-sm hover:bg-yellow-400 transition-colors whitespace-nowrap"
          >
            {c.ctaButton}
          </Link>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-6 text-xs text-gray-400">{c.footer}</footer>
    </div>
  );
}
