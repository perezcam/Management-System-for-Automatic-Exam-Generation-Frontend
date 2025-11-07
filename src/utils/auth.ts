import { jwtVerify } from "jose";
import { isRole, type Role } from "@/utils/access";

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
