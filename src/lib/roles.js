// Client-side mirror of the role hierarchy (see api/_roles.js for the trusted,
// server-enforced copy). Used for labels and for deciding which role options to
// SHOW; the server still validates every change.
//
//     owner (EY)  >  superadmin (bank)  >  admin  >  analyst
//
import { translate } from './i18n';
import useSettingsStore from '../store/useSettingsStore';
export const ROLE_RANK = { analyst: 0, admin: 1, superadmin: 2, owner: 3 };
export const ROLES = ['analyst', 'admin', 'superadmin', 'owner'];
export const ROLE_LABELS = {
  owner: 'EY Admin',
  superadmin: 'Super Admin',
  admin: 'Admin',
  analyst: 'Analyst',
};

export const rank = (role) => (role in ROLE_RANK ? ROLE_RANK[role] : -1);

// Language-aware role label. Reads the current UI language and the role.* i18n
// keys; falls back to the English ROLE_LABELS if a key is missing.
export function roleLabel(role) {
  if (!role) return '—';
  const lang = useSettingsStore.getState().language;
  const label = translate(lang, `role.${role}`);
  if (label && label !== `role.${role}`) return label;
  return ROLE_LABELS[role] || role;
}

// The single role a viewer may INVITE — strictly one step down (EY →
// superadmin → admin → analyst). null if they can't invite.
export function invitableRole(viewerRole) {
  const vr = rank(viewerRole);
  if (vr < ROLE_RANK.admin) return null;
  return ROLES[vr - 1] || null;
}

// Roles a viewer may ASSIGN to an existing user (promote/demote): everything
// strictly below their own rank.
export function manageableRoles(viewerRole) {
  const vr = rank(viewerRole);
  if (vr < ROLE_RANK.admin) return [];
  return ROLES.filter((r) => rank(r) < vr);
}
