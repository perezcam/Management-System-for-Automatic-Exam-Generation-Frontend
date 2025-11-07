import { jwtVerify } from "jose";
import type { Role } from "@/utils/access";

const ALL_ROLES: Role[] = ["student","admin","teacher","subjectleader","examiner"];
const isRole = (x: unknown): x is Role => typeof x === "string" && ALL_ROLES.includes(x as Role);

export async function getRolesFromToken(token?: string): Promise<Role[]> {
  if (!token) return [];
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    const roles = (payload).roles;
    if (!Array.isArray(roles)) return [];
    return roles.filter(isRole);
  } catch {
    return [];
  }
}
