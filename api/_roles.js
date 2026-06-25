// Single source of truth for the role hierarchy, shared by every server-side
// endpoint (invite / set-role / manage-user). Keeping the ranks in one place
// means the permission rules can't drift apart between endpoints.
//
//     owner (EY)  >  superadmin (bank)  >  admin  >  analyst
//
export const ROLE_RANK = { analyst: 0, admin: 1, superadmin: 2, owner: 3 };
export const ROLES = ['analyst', 'admin', 'superadmin', 'owner'];

export function rank(role) {
  return Object.prototype.hasOwnProperty.call(ROLE_RANK, role) ? ROLE_RANK[role] : -1;
}

// A caller may act on / assign a role only if they are at least an admin and the
// other role is at or below their own rank (so an admin can't touch a
// super-admin, a super-admin can't create an owner, etc.).
export function callerOutranksOrEquals(callerRole, otherRole) {
  return rank(callerRole) >= ROLE_RANK.admin && rank(callerRole) >= rank(otherRole);
}
