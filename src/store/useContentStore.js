import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_CONTENT, hydrateContent } from '../data/indicators';

// Owns the questionnaire content lifecycle: load it from Supabase at boot (with
// the bundled defaults as a fallback), and—for admins—seed an empty database
// and save edits to dimensions and indicators.
//
// `version` is bumped whenever the live content changes so that components which
// render from INDICATORS / DIMENSIONS can subscribe and re-render after an edit.
const useContentStore = create((set, get) => ({
  loading: true,
  source: 'default',   // 'default' (bundled) | 'remote' (Supabase)
  error: null,
  version: 0,

  // Fetch dimensions + indicators. On anything unexpected (not configured,
  // network error, or empty tables) we keep the bundled defaults so the app
  // always works. Always resolves so boot is never blocked.
  async loadContent() {
    if (!isSupabaseConfigured) {
      set({ loading: false, source: 'default' });
      return;
    }
    try {
      const [{ data: dims, error: e1 }, { data: inds, error: e2 }] = await Promise.all([
        supabase.from('dimensions').select('*'),
        supabase.from('indicators').select('*'),
      ]);
      if (e1 || e2 || !dims?.length || !inds?.length) {
        // Tables empty or not migrated yet — stay on bundled defaults.
        set({ loading: false, source: 'default', error: e1?.message || e2?.message || null });
        return;
      }
      hydrateContent(dims, inds);
      set(s => ({ loading: false, source: 'remote', error: null, version: s.version + 1 }));
    } catch (err) {
      set({ loading: false, source: 'default', error: err.message });
    }
  },

  // Admin: copy the bundled defaults into the (empty) database so they can be
  // edited. Upsert keeps it idempotent if run more than once.
  async seedDefaults() {
    const { dimensions, indicators } = DEFAULT_CONTENT;
    const dimRows = Object.entries(dimensions).map(([code, d], i) => ({
      code,
      name: d.name,
      weight: d.weight,
      color: d.color,
      proxy: !!d.proxy,
      sort_order: i,
    }));
    const indRows = indicators.map((ind, i) => ({
      id: ind.id,
      dim: ind.dim,
      sub: ind.sub,
      sub_name: ind.subName,
      bct: !!ind.bct,
      q: ind.q,
      hint: ind.hint || '',
      rubric: ind.rubric,
      sort_order: i,
    }));
    const { error: e1 } = await supabase.from('dimensions').upsert(dimRows);
    if (e1) return { error: e1.message };
    const { error: e2 } = await supabase.from('indicators').upsert(indRows);
    if (e2) return { error: e2.message };
    await get().loadContent();
    return { error: null };
  },

  async saveDimension(code, patch) {
    const { error } = await supabase.from('dimensions').update(patch).eq('code', code);
    if (error) return { error: error.message };
    await get().loadContent();
    return { error: null };
  },

  async saveIndicator(id, patch) {
    const { error } = await supabase.from('indicators').update(patch).eq('id', id);
    if (error) return { error: error.message };
    await get().loadContent();
    return { error: null };
  },
}));

export default useContentStore;
