import { Link } from 'react-router-dom';
import { INDICATORS, DIMENSIONS } from '../data/indicators';

// Public landing page — the very first thing anyone sees, signed in or not, and
// regardless of role. Written in plain language so a visitor with no data or
// technical background understands what DataPilot is and how it works before
// they ever log in. The only action is "Log in".
const STEPS = [
  {
    title: 'Sign in',
    desc: 'Your administrator gives you an account. You sign in — there is nothing to install.',
  },
  {
    title: 'Answer simple questions',
    desc: `Go through ${INDICATORS.length} short questions about how your bank handles its data — how it is organised, kept accurate, protected and actually used. They are grouped into ${Object.keys(DIMENSIONS).length} easy themes.`,
  },
  {
    title: 'Get your score',
    desc: 'DataPilot instantly turns your answers into a clear maturity score from 1 (just starting) to 5 (best-in-class), with easy-to-read charts.',
  },
  {
    title: 'See what to fix first',
    desc: 'It highlights your weakest areas and builds a prioritised action plan (with AI help) so you know exactly what to improve first.',
  },
  {
    title: 'Check the rules & share',
    desc: 'See whether you meet the Tunisian central bank (BCT) data rules and international standards, then download a polished PDF report for management.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left — branding + what it is */}
      <div className="lg:w-[45%] bg-ey-charcoal text-white flex flex-col justify-between p-10 lg:p-14">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-ey-yellow text-ey-charcoal font-bold px-2 py-0.5 rounded text-lg leading-none">EY</span>
            <span className="text-2xl font-light">DataPilot</span>
          </div>
          <div className="w-16 h-1 bg-ey-yellow my-6" />
          <h1 className="text-3xl lg:text-4xl font-light leading-tight">
            How well does your bank<br />manage its data?
          </h1>
          <p className="text-gray-300 leading-relaxed mt-6 max-w-md">
            DataPilot is a simple, guided check-up of your bank's{' '}
            <span className="text-white font-medium">data maturity</span> — how well it
            organises, protects and uses its data. You answer plain questions; the tool does
            the analysis, scores your bank, checks it against banking regulations, and gives
            you a step-by-step plan to improve.
          </p>
          <p className="text-sm text-gray-400 mt-4 max-w-md">
            No technical background needed. Whether you are an analyst filling it in or an
            administrator overseeing your team, everything starts here.
          </p>
        </div>
        <div className="text-gray-500 text-xs mt-10">
          EY Advisory Tunisia · PFE 2026 Internship Project
        </div>
      </div>

      {/* Right — how it works + log in */}
      <div className="lg:w-[55%] bg-gray-50 flex items-center justify-center p-10">
        <div className="w-full max-w-lg">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-ey-purple mb-5">
            How it works
          </div>
          <div className="flex flex-col">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-ey-charcoal text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  {i < STEPS.length - 1 && <div className="w-px flex-1 bg-gray-300 my-1" />}
                </div>
                <div className={i < STEPS.length - 1 ? 'pb-5' : ''}>
                  <div className="text-sm font-semibold text-gray-800 leading-tight">{step.title}</div>
                  <div className="text-sm text-gray-500 leading-snug mt-0.5">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/login"
            className="mt-8 inline-flex items-center justify-center w-full bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-6 py-3 text-base hover:bg-yellow-400 transition-colors"
          >
            Log in to get started
          </Link>
          <p className="text-center text-xs text-gray-400 mt-3">
            Accounts are created by your administrator. Use the email where you received your invite.
          </p>
        </div>
      </div>
    </div>
  );
}
