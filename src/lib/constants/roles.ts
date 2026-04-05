/**
 * Role constants — single source of truth for all role strings used in RBAC.
 * Import from here instead of hardcoding "owner", "rep", "ops", etc.
 */
export const ROLES = {
  OWNER: "owner",
  REP: "rep",
  OPS: "ops",
  MARKETING: "marketing",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
