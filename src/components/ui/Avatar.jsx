// Small round avatar: shows the user's photo when set, otherwise initials on a
// muted background. Used in the top bar and on the account page.
function initials(name, email) {
  const src = (name || '').trim();
  if (src) {
    const parts = src.split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  }
  return (email || '?').trim().slice(0, 2).toUpperCase();
}

export default function Avatar({ url, name, email, size = 32, className = '' }) {
  const dim = { width: size, height: size };
  if (url) {
    return (
      <img
        src={url}
        alt={name || email || 'avatar'}
        style={dim}
        className={`rounded-full object-cover bg-gray-200 ${className}`}
      />
    );
  }
  return (
    <span
      style={{ ...dim, fontSize: Math.round(size * 0.4) }}
      className={`rounded-full bg-ey-purple text-white font-semibold flex items-center justify-center select-none ${className}`}
    >
      {initials(name, email)}
    </span>
  );
}
