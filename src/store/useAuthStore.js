import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Auth + role state for the whole app. Kept separate from useAppStore (which
// holds the assessment data) so the two concerns stay independent: this store
// is the single source of truth for "who is signed in and what can they do".
//
// Roles live in a `profiles` table (see supabase/schema.sql). Every auth user
// has exactly one profile row with role 'superadmin', 'admin' or 'analyst'. We
// treat any unknown/missing role as the least-privileged 'analyst'.
//
// The three tiers are hierarchical: a super-admin can do everything an admin
// can (plus manage admins), and an admin can do everything an analyst can (plus
// manage analysts and review submissions). isAdmin() therefore returns true for
// super-admins too, so admin-gated surfaces stay open to them automatically.
const ROLES = ['superadmin', 'admin', 'analyst'];

const useAuthStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────
  session: null,
  user: null,
  role: null,        // 'superadmin' | 'admin' | 'analyst' | null (until loaded)
  loading: true,     // true until the initial session check resolves
  error: null,
  _initialized: false,

  // ── Selectors ──────────────────────────────────────────────────────
  isAuthenticated: () => Boolean(get().session),
  // Admin-level access: granted to admins AND super-admins (capability
  // inheritance), matching the database's is_admin() helper.
  isAdmin: () => get().role === 'admin' || get().role === 'superadmin',
  isSuperAdmin: () => get().role === 'superadmin',

  // ── Actions ────────────────────────────────────────────────────────

  // Loads the signed-in user's role from the `profiles` table. Defaults to
  // 'analyst' if the row is missing so a misconfigured profile never grants
  // admin access by accident.
  async fetchRole(userId) {
    if (!userId) {
      set({ role: null });
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    if (error) {
      // Missing row or RLS issue — fail closed to the least-privileged role.
      set({ role: 'analyst' });
      return;
    }
    // Accept only known roles; anything unexpected fails closed to 'analyst'.
    set({ role: ROLES.includes(data?.role) ? data.role : 'analyst' });
  },

  // Wires up the session listener once. Call from a top-level effect. Returns
  // an unsubscribe function for cleanup.
  init() {
    if (get()._initialized) return () => {};
    set({ _initialized: true });

    if (!isSupabaseConfigured) {
      // No backend configured yet — resolve loading so the UI can show its
      // "configure Supabase" notice instead of spinning forever.
      set({ loading: false });
      return () => {};
    }

    // Reflect every auth change (initial load, sign-in, sign-out, token refresh)
    // into the store and keep the role in sync with the current user.
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, user: session?.user ?? null });
      await get().fetchRole(session?.user?.id);
      set({ loading: false });
    });

    // Cover the case where a session already exists at boot (the listener also
    // fires, but this avoids any gap if it doesn't on a given platform).
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session && !get().session) {
        set({ session: data.session, user: data.session.user });
        await get().fetchRole(data.session.user.id);
      }
      set({ loading: false });
    });

    return () => sub.subscription.unsubscribe();
  },

  async signIn(email, password) {
    set({ error: null });
    if (!isSupabaseConfigured) {
      const msg = 'Authentication backend is not configured yet.';
      set({ error: msg });
      return { error: msg };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      set({ error: error.message });
      return { error: error.message };
    }
    // onAuthStateChange will populate session/role; do it eagerly too so the
    // caller can navigate immediately without a flash of the login screen.
    set({ session: data.session, user: data.user });
    await get().fetchRole(data.user.id);
    return { error: null };
  },

  async signOut() {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    set({ session: null, user: null, role: null, error: null });
  },
}));

export default useAuthStore;
