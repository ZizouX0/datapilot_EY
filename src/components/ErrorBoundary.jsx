import { Component } from 'react';
import useSettingsStore from '../store/useSettingsStore';

// Top-level error boundary. Without one, any render-time throw (a malformed
// server row, a bad chart input) or a failed lazy-chunk load (common after a
// new deploy invalidates old hashes) unmounts the whole React tree to a blank
// white screen with no recovery. This catches those, shows a translated
// fallback, and offers a reload. Class component because only class components
// can be error boundaries (getDerivedStateFromError / componentDidCatch).
const COPY = {
  en: {
    title: 'Something went wrong',
    body: 'The page hit an unexpected error. This is sometimes caused by a new version being deployed while the app was open.',
    reload: 'Reload the app',
    stale: 'A new version is available. Reload to continue.',
  },
  fr: {
    title: 'Une erreur est survenue',
    body: 'La page a rencontré une erreur inattendue. Cela peut arriver lorsqu’une nouvelle version est déployée pendant que l’application est ouverte.',
    reload: 'Recharger l’application',
    stale: 'Une nouvelle version est disponible. Rechargez pour continuer.',
  },
};

// A failed dynamic import (stale chunk) throws with a recognizable message.
function isChunkLoadError(error) {
  const msg = String(error?.message || '');
  return /Loading chunk|dynamically imported module|Failed to fetch dynamically/i.test(msg);
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surface to the console (and any future logger) instead of swallowing.
    console.error('Unhandled render error:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const lang = useSettingsStore.getState().language;
    const c = COPY[lang] || COPY.en;
    const chunk = isChunkLoadError(error);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h1 className="text-lg font-semibold text-gray-800">{c.title}</h1>
          <p className="text-sm text-gray-500 mt-2">{chunk ? c.stale : c.body}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 w-full bg-ey-yellow text-ey-charcoal font-semibold rounded-lg py-2.5 text-sm hover:bg-yellow-400 transition-colors"
          >
            {c.reload}
          </button>
        </div>
      </div>
    );
  }
}
