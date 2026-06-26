import useSettingsStore from '../../store/useSettingsStore';

// Compact EN / FR switch used everywhere — the top bar (signed in) and the
// public/auth screens (signed out). Writes to useSettingsStore, which persists
// the choice to localStorage and applies it app-wide instantly. `variant`
// adapts the colours to a dark (charcoal) or light background.
const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
];

export default function LanguageToggle({ variant = 'dark', className = '' }) {
  const language = useSettingsStore(s => s.language);
  const setLanguage = useSettingsStore(s => s.setLanguage);

  const border = variant === 'dark' ? 'border-gray-600' : 'border-gray-300';
  const inactive = variant === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100';
  const active = variant === 'dark' ? 'bg-ey-yellow text-ey-charcoal' : 'bg-ey-charcoal text-white';

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex items-center rounded-lg border ${border} overflow-hidden ${className}`}
    >
      {LANGS.map(l => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLanguage(l.code)}
          aria-pressed={language === l.code}
          title={l.code === 'fr' ? 'Passer en français' : 'Switch to English'}
          className={`px-2 py-1 text-xs font-semibold transition-colors ${language === l.code ? active : inactive}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
