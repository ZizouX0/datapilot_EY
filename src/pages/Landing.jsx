import { Link } from 'react-router-dom';
import { INDICATORS, DIMENSIONS } from '../data/indicators';
import LanguageToggle from '../components/ui/LanguageToggle';

// Public landing page — the first thing anyone sees, signed in or not. It leads
// with WHAT DataPilot is and WHY it is credible (the frameworks it is built on
// and the safeguards that keep its scores honest), so a visitor trusts the tool
// before signing in. Sign-in itself is kept deliberately small and secondary.

const STEPS = [
  { title: 'Sign in', desc: 'Your administrator gives you an account — nothing to install.' },
  { title: 'Answer simple questions', desc: `Go through ${INDICATORS.length} short questions about how your bank handles its data, grouped into ${Object.keys(DIMENSIONS).length} clear themes.` },
  { title: 'Get your score', desc: 'Answers become a 1–5 maturity score with easy-to-read charts.' },
  { title: 'See what to fix first', desc: 'A prioritised, AI-assisted action plan shows what to improve first.' },
  { title: 'Check the rules & share', desc: 'See BCT and international compliance, then export a polished PDF report.' },
];

const FRAMEWORKS = [
  { tag: 'CMMI', title: 'Capability Maturity Model', desc: 'The internationally recognised 5-level scale — Initial → Optimized — used to rate each capability objectively rather than by opinion.' },
  { tag: 'Gartner', title: 'Data & Analytics Maturity', desc: 'Gartner’s maturity stages (Unaware → Transformative) frame exactly where the bank stands on its data journey.' },
  { tag: 'BCT', title: 'Banque Centrale de Tunisie', desc: 'Key indicators map to BCT regulatory data expectations, so compliance is measured and reported — not assumed.' },
  { tag: 'Method', title: 'Weighted multi-dimension model', desc: 'A transparent weighted formula across the dimensions produces one defensible global score, fully shown in the report.' },
];

const TRUST = [
  { icon: '🎯', title: 'Evidence-based scoring', desc: 'A high score with no documented evidence is automatically capped — results reflect reality, not optimism.' },
  { icon: '🏦', title: 'Regulatory by design', desc: 'BCT-critical indicators cannot be skipped, and a compliance rate is computed for every assessment.' },
  { icon: '⚖️', title: 'Transparent weighting', desc: 'Each dimension’s contribution to the score is explicit and shown in the report — nothing is a black box.' },
  { icon: '🤝', title: 'Built for real org charts', desc: 'Departments can each own the dimensions they know best, then a coordinator consolidates one shared result.' },
];

export default function Landing() {
  const dims = Object.entries(DIMENSIONS);

  return (
    <div className="min-h-screen bg-white">
      {/* Slim top bar — logo left, small secondary sign-in right. */}
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
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — the message is the star. */}
      <section className="bg-ey-charcoal text-white">
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-16 lg:pt-16 lg:pb-24">
          <div className="w-16 h-1 bg-ey-yellow mb-6" />
          <h1 className="text-3xl lg:text-5xl font-light leading-tight max-w-3xl">
            How well does your bank <span className="text-ey-yellow">manage its data?</span>
          </h1>
          <p className="text-gray-300 leading-relaxed mt-6 max-w-2xl text-lg">
            DataPilot is a rigorous, guided assessment of your bank’s <span className="text-white font-medium">data maturity</span> —
            how well it governs, protects and uses its data. You answer plain questions; the tool does the analysis,
            scores your bank against established frameworks, checks it against banking regulation, and builds a
            step-by-step plan to improve.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-400">
            <span>★ {INDICATORS.length} indicators</span>
            <span>★ {dims.length} weighted dimensions</span>
            <span>★ CMMI · Gartner · BCT aligned</span>
          </div>
        </div>
      </section>

      {/* Built on recognised frameworks — the credibility section. */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-ey-purple mb-2">Built on recognised frameworks</div>
        <h2 className="text-2xl font-light text-gray-800 max-w-2xl">
          Not a questionnaire with a gut-feel score — a method grounded in the standards banks already trust.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {FRAMEWORKS.map(f => (
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
            The {dims.length} dimensions and how much each counts
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
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-ey-purple mb-6">How it works</div>
          <div className="grid md:grid-cols-5 gap-4">
            {STEPS.map((step, i) => (
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
        <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-ey-purple mb-2">Why you can trust the result</div>
        <h2 className="text-2xl font-light text-gray-800 max-w-2xl">Safeguards that keep every score honest and defensible.</h2>
        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          {TRUST.map(t => (
            <div key={t.title} className="flex gap-4 rounded-xl border border-gray-200 p-5">
              <div className="text-2xl flex-shrink-0">{t.icon}</div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{t.title}</div>
                <p className="text-sm text-gray-500 mt-0.5 leading-snug">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modest closing sign-in. */}
      <section className="bg-ey-charcoal text-white">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-lg font-medium">Ready to begin?</div>
            <p className="text-sm text-gray-400">Use the email where you received your invite — accounts are created by your administrator.</p>
          </div>
          <Link
            to="/login"
            className="bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-6 py-2.5 text-sm hover:bg-yellow-400 transition-colors whitespace-nowrap"
          >
            Sign in to get started →
          </Link>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-6 text-xs text-gray-400">
        EY Advisory Tunisia · PFE 2026 Internship Project
      </footer>
    </div>
  );
}
