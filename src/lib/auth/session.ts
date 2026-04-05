import { ROLES, type Role } from "@/lib/constants/roles";

export const SESSION_COOKIE_NAME = "buddas_session";
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 5;
export const LEGACY_ADMIN_ROLE = "admin";

export const CRM_ALLOWED_ROLES = [
  ROLES.OWNER,
  ROLES.OPS,
  ROLES.MARKETING,
  ROLES.REP,
  LEGACY_ADMIN_ROLE,
] as const;

export type CRMRole = Role | typeof LEGACY_ADMIN_ROLE;

export function isAuthorizedCrmRole(role: string | null | undefined): role is CRMRole {
  return CRM_ALLOWED_ROLES.includes(role as CRMRole);
}
