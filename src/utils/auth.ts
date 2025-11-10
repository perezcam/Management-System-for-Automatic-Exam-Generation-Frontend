import { jwtVerify } from "jose";
import { isRole, type Role } from "@/utils/access";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

export async function getRolesFromToken(token?: string): Promise<Role[]> {
  if (!token || !ACCESS_SECRET) return [];
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(ACCESS_SECRET));
    const roles = payload.roles;
    if (!Array.isArray(roles)) return [];
    return roles.filter(isRole);
  } catch {
    return [];
  }
}
