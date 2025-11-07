import { SignJWT } from "jose";

interface JwtPayload {
  sub?: string;
  roles?: string[];
  [key: string]: unknown;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

export async function signTestToken(
  payload: JwtPayload = { sub: "user123", roles: ["teacher"] },
  exp: string = "1h"
): Promise<string> {
  if (!ACCESS_SECRET) throw new Error("JWT_ACCESS_SECRET is not defined");
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(new TextEncoder().encode(ACCESS_SECRET));
}
