import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import useSettingsStore from './useSettingsStore';

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
const ROLES = ['owner', 'superadmin', 'admin', 'analyst'];

// Reload the per-bank questionnaire once the signed-in user's bank is known.
// Dynamic import avoids a static cycle (useContentStore imports this store).
function reloadContentForBank() {
  import('./useContentStore').then(m => m.default.getState().loadContent()).catch(() => {});
}

const useAuthStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────
  session: null,
  user: null,
  role: null,        // 'superadmin' | 'admin' | 'analyst' | null (until loaded)
  fullName: null,    // the signed-in user's display name (from profiles)
  avatarUrl: null,   // the signed-in user's avatar URL (from profiles)
  bankName: null,    // the user's organisation bank (inherited from inviter)
  phone: null,       // the user's recovery/contact phone (from profiles)
  departmentId: null, // the user's department (Model B group assessments)
  loading: true,     // true until the initial session check resolves
  error: null,
  _initialized: false,

  // ── Selectors ──────────────────────────────────────────────────────
  isAuthenticated: () => Boolean(get().session),
  // Capability inheritance (owner > superadmin > admin > analyst), matching the
  // database's is_admin() / is_superadmin() helpers.
  isAdmin: () => ['admin', 'superadmin', 'owner'].includes(get().role),
  isSuperAdmin: () => ['superadmin', 'owner'].includes(get().role),
  isOwner: () => get().role === 'owner',

  // ── Actions ────────────────────────────────────────────────────────

  // Loads the signed-in user's role from the `profiles` table. Defaults to
  // 'analyst' if the row is missing so a misconfigured profile never grants
  // admin access by accident.
  async fetchRole(userId) {
    if (!userId) {
      set({ role: null, fullName: null, avatarUrl: null, bankName: null, phone: null, departmentId: null });
      reloadContentForBank();
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('role, full_name, language, avatar_url, bank_name, phone, department_id')
      .eq('id', userId)
      .single();
    if (error) {
      // Missing row or RLS issue — fail closed to the least-privileged role.
      set({ role: 'analyst', fullName: null, avatarUrl: null, bankName: null, phone: null, departmentId: null });
      reloadContentForBank();
      return;
    }
    // Accept only known roles; anything unexpected fails closed to 'analyst'.
    set({
      role: ROLES.includes(data?.role) ? data.role : 'analyst',
      fullName: data?.full_name || null,
      avatarUrl: data?.avatar_url || null,
      bankName: data?.bank_name || null,
      phone: data?.phone || null,
      departmentId: data?.department_id || null,
    });
    // Apply the user's saved language preference app-wide.
    if (data?.language) useSettingsStore.getState().setLanguage(data.language);
    // Load the questionnaire copy for this user's bank (per-bank content).
    reloadContentForBank();
  },

  // Re-fetch the signed-in user's profile (role, bank, department, …) without a
  // full re-auth. Used so a mid-session change — e.g. a Super Admin assigning
  // this analyst to a department — shows up without signing out and back in.
  async refreshProfile() {
    const id = get().user?.id;
    if (id) await get().fetchRole(id);
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
      // error.message is usually a clean string, but some backend 5xx responses
      // surface as an empty/object message that would render as "{}". Fall back
      // to a readable line so the user is never shown a bare object.
      const msg =
        (typeof error.message === 'string' && error.message.trim() && error.message !== '{}'
          ? error.message
          : 'Could not sign in. Please check your email and password and try again.');
      set({ error: msg });
      return { error: msg };
    }
    // onAuthStateChange will populate session/role; do it eagerly too so the
    // caller can navigate immediately without a flash of the login screen.
    set({ session: data.session, user: data.user });
    await get().fetchRole(data.user.id);
    return { error: null };
  },

  async signOut() {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    set({ session: null, user: null, role: null, fullName: null, avatarUrl: null, bankName: null, phone: null, departmentId: null, error: null });
    // Clear the solo assessment too, so the next person on a shared browser
    // doesn't inherit the previous analyst's profile/answers. Dynamic import
    // avoids a static cycle.
    import('./useAppStore').then(m => m.default.getState().resetAll()).catch(() => {});
  },
}));

export default useAuthStore;
