import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { translate } from '../lib/i18n';

// UI preferences for the signed-in user. Language is persisted to localStorage
// for instant application on load, and mirrored to the user's profile (via
// /api/update-self) so it follows them across devices. useAuthStore syncs the
// stored profile language down into here at sign-in.
const useSettingsStore = create(
  persist(
    (set, get) => ({
      language: 'en', // 'en' | 'fr'

      setLanguage(language) {
        if (language !== 'en' && language !== 'fr') return;
        set({ language });
        if (typeof document !== 'undefined') {
          document.documentElement.lang = language;
        }
      },

      // Bound translator for the current language.
      t(key) {
        return translate(get().language, key);
      },
    }),
    {
      name: 'datapilot-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ language: s.language }),
      onRehydrateStorage: () => (state) => {
        if (state?.language && typeof document !== 'undefined') {
          document.documentElement.lang = state.language;
        }
      },
    },
  ),
);

export default useSettingsStore;
