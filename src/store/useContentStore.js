import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_CONTENT, hydrateContent, DIMENSIONS, INDICATORS } from '../data/indicators';

// ── ID/code generators, derived from the current in-memory content ──────────
// Codes follow the existing convention: dimensions 'D{n}', sub-dimensions
// '{n}.{m}', indicators 'D{sub}-{nn}'. New items continue the highest number.
function nextDimCode() {
  let max = 0;
  Object.keys(DIMENSIONS).forEach(c => {
    const n = parseInt(String(c).replace(/\D/g, ''), 10);
    if (!Number.isNaN(n)) max = Math.max(max, n);
  });
  return `D${max + 1}`;
}

function nextSubCode(dim) {
  const dimNum = String(dim).replace(/\D/g, '');
  let max = 0;
  (DIMENSIONS[dim]?.subDims || []).forEach(s => {
    const minor = parseInt(String(s).split('.')[1], 10);
    if (!Number.isNaN(minor)) max = Math.max(max, minor);
  });
  return `${dimNum}.${max + 1}`;
}

function nextIndicatorId(sub) {
  const prefix = `D${sub}-`;
  let max = 0;
  INDICATORS.forEach(i => {
    if (i.id.startsWith(prefix)) {
      const n = parseInt(i.id.slice(prefix.length), 10);
      if (!Number.isNaN(n)) max = Math.max(max, n);
    }
  });
  return `${prefix}${String(max + 1).padStart(2, '0')}`;
}

function nextSortOrder() {
  return INDICATORS.reduce((m, i) => Math.max(m, i.sort_order ?? 0), 0) + 1;
}

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

  // ── Structural edits: add / remove indicators, sub-dimensions, dimensions ──

  // Add a new (blank) indicator to an existing dimension + sub-dimension.
  async addIndicator(dim, sub, subName) {
    const row = {
      id: nextIndicatorId(sub),
      dim,
      sub,
      sub_name: subName,
      bct: false,
      q: 'New indicator — edit me',
      hint: '',
      rubric: ['', '', '', '', ''],
      sort_order: nextSortOrder(),
    };
    const { error } = await supabase.from('indicators').insert(row);
    if (error) return { error: error.message };
    await get().loadContent();
    return { error: null, id: row.id };
  },

  async deleteIndicator(id) {
    const { error } = await supabase.from('indicators').delete().eq('id', id);
    if (error) return { error: error.message };
    await get().loadContent();
    return { error: null };
  },

  // A sub-dimension is represented by its indicators (there is no separate
  // table), so adding one means creating its first indicator under a new code.
  async addSubDimension(dim, name) {
    return get().addIndicator(dim, nextSubCode(dim), name);
  },

  // Rename a sub-dimension = update the name on every indicator in that group.
  async renameSubDimension(dim, sub, name) {
    const { error } = await supabase
      .from('indicators').update({ sub_name: name })
      .eq('dim', dim).eq('sub', sub);
    if (error) return { error: error.message };
    await get().loadContent();
    return { error: null };
  },

  // Remove a sub-dimension = delete all of its indicators.
  async deleteSubDimension(dim, sub) {
    const { error } = await supabase
      .from('indicators').delete()
      .eq('dim', dim).eq('sub', sub);
    if (error) return { error: error.message };
    await get().loadContent();
    return { error: null };
  },

  async addDimension({ name, weight = 0.1, color = '#888888', proxy = false }) {
    const code = nextDimCode();
    const { error } = await supabase.from('dimensions').insert({
      code,
      name,
      weight: Number(weight) || 0,
      color,
      proxy: !!proxy,
      sort_order: Object.keys(DIMENSIONS).length,
    });
    if (error) return { error: error.message };
    await get().loadContent();
    return { error: null, code };
  },

  // Deleting a dimension cascades to its indicators via the FK in phase2.sql.
  async deleteDimension(code) {
    const { error } = await supabase.from('dimensions').delete().eq('code', code);
    if (error) return { error: error.message };
    await get().loadContent();
    return { error: null };
  },
}));

export default useContentStore;
