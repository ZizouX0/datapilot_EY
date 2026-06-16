// Branded cover page rendered as the first page of every exported PDF.
// Hidden on screen (.print-only) and shown only when printing.

function formatDate(d) {
  if (!d) return '—';
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return d;
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function ReportCover({ title, subtitle, profile = {} }) {
  const generated = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const meta = [
    ['Bank', profile.bankName],
    ['Assessment date', formatDate(profile.date)],
    [
      'Prepared by',
      profile.respondentName
        ? `${profile.respondentName}${profile.role ? ' · ' + profile.role : ''}`
        : '',
    ],
    ['Email', profile.email],
    ['Report generated', generated],
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
          <div className="text-sm text-gray-400 mt-1">Data Maturity Steering Tool</div>
        </div>
      </div>

      {/* Angled yellow title block */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
        style={{ width: '60%', background: '#FFE600', clipPath: 'polygon(14% 0, 100% 0, 100% 100%, 0 100%)' }}
      >
        <div className="py-16 pl-24 pr-16 text-ey-charcoal">
          <div className="text-xs font-bold tracking-[0.3em] uppercase mb-3 opacity-70">
            EY Advisory Tunisie
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
        <span>EY Advisory Tunisie</span>
        <span>BCT Circulaire N°2025-08 · Confidential</span>
      </div>
    </div>
  );
}
