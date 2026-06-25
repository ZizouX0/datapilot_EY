// Client-side mirror of the role hierarchy (see api/_roles.js for the trusted,
// server-enforced copy). Used for labels and for deciding which role options to
// SHOW; the server still validates every change.
//
//     owner (EY)  >  superadmin (bank)  >  admin  >  analyst
//
export const ROLE_RANK = { analyst: 0, admin: 1, superadmin: 2, owner: 3 };
export const ROLES = ['analyst', 'admin', 'superadmin', 'owner'];
export const ROLE_LABELS = {
  owner: 'EY Admin',
  superadmin: 'Super Admin',
  admin: 'Admin',
  analyst: 'Analyst',
};

export const rank = (role) => (role in ROLE_RANK ? ROLE_RANK[role] : -1);
export const roleLabel = (role) => ROLE_LABELS[role] || role || '—';

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
