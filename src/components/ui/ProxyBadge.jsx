import useSettingsStore from '../../store/useSettingsStore';

const COPY = {
  en: { proxy: 'Proxy' },
  fr: { proxy: 'Proxy' },
};

export default function ProxyBadge() {
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-xs font-medium">
      {c.proxy}
    </span>
  );
}
