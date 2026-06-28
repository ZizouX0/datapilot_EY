// Branded cover page rendered as the first page of every exported PDF.
// Hidden on screen (.print-only) and shown only when printing.

import useSettingsStore from '../store/useSettingsStore';

const COPY = {
  en: {
    locale: 'en-GB',
    tagline: 'Data Maturity Steering Tool',
    eyebrow: 'EY Advisory Tunisia',
    bank: 'Bank',
    assessmentDate: 'Assessment date',
    preparedBy: 'Prepared by',
    email: 'Email',
    reportGenerated: 'Report generated',
    footerLeft: 'EY Advisory Tunisia',
    footerRight: 'BCT Circulaire N°2025-08 · Confidential',
  },
  fr: {
    locale: 'fr-FR',
    tagline: 'Outil de pilotage de la maturité des données',
    eyebrow: 'EY Advisory Tunisie',
    bank: 'Banque',
    assessmentDate: 'Date d\'évaluation',
    preparedBy: 'Préparé par',
    email: 'E-mail',
    reportGenerated: 'Rapport généré le',
    footerLeft: 'EY Advisory Tunisie',
    footerRight: 'BCT Circulaire N°2025-08 · Confidentiel',
  },
};

function formatDate(d, locale) {
  if (!d) return '—';
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return d;
  return parsed.toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function ReportCover({ title, subtitle, profile = {} }) {
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;

  const generated = new Date().toLocaleDateString(c.locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const meta = [
    [c.bank, profile.bankName],
    [c.assessmentDate, formatDate(profile.date, c.locale)],
    [
      c.preparedBy,
      profile.respondentName
        ? `${profile.respondentName}${profile.role ? ' · ' + profile.role : ''}`
        : '',
    ],
    [c.email, profile.email],
    [c.reportGenerated, generated],
  ];

  return (
    <div className="report-cover print-only relative text-white" style={{ background: '#2E2E38' }}>
      {/* Decorative accents */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 80% at 0% 0%, rgba(61,16,138,0.55), transparent 55%)' }}
      />
      <div className="absolute left-0 top-0 h-full w-2" style={{ background: '#FFE600' }} />

      {/* Brand mark */}
      <div className="absolute top-16 left-16 z-10 flex items-center gap-3">
        <span className="bg-ey-yellow text-ey-charcoal font-bold px-3 py-1 rounded text-3xl leading-none">
          EY
        </span>
        <div>
          <div className="text-2xl font-semibold leading-none">DataPilot</div>
          <div className="text-sm text-gray-400 mt-1">{c.tagline}</div>
        </div>
      </div>

      {/* Angled yellow title block */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
        style={{ width: '60%', background: '#FFE600', clipPath: 'polygon(14% 0, 100% 0, 100% 100%, 0 100%)' }}
      >
        <div className="py-16 pl-24 pr-16 text-ey-charcoal">
          <div className="text-xs font-bold tracking-[0.3em] uppercase mb-3 opacity-70">
            {c.eyebrow}
          </div>
          <div className="text-5xl font-bold leading-tight">{title}</div>
          {subtitle && <div className="text-xl font-medium mt-3 opacity-80">{subtitle}</div>}
        </div>
      </div>

      {/* Assessment metadata */}
      <div className="absolute bottom-32 left-16 z-10 flex flex-col gap-4">
        {meta.map(([label, val]) => (
          <div key={label}>
            <div className="text-[10px] uppercase tracking-widest text-gray-400">{label}</div>
            <div className="text-base font-semibold">{val || '—'}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="absolute bottom-12 left-16 right-16 z-10 border-t border-gray-600 pt-4 flex justify-between text-xs text-gray-400">
        <span>{c.footerLeft}</span>
        <span>{c.footerRight}</span>
      </div>
    </div>
  );
}
