import { SignJWT } from "jose";

interface JwtPayload {
  sub?: string;
  roles?: string[];
  [key: string]: unknown;
}

export async function signTestToken(
  payload: JwtPayload = { sub: "user123", roles: ["teacher"] },
  exp: string = "1h"
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(new TextEncoder().encode(process.env.JWT_SECRET!));
}
