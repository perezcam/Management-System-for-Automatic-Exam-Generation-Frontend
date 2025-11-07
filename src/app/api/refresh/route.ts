import { NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";

export async function POST() {
  const res = NextResponse.next();
  // lee refresh_token de cookies (con cookies() en server) y verifícalo
  // si es válido, firma uno nuevo de acceso y setéalo igual que en login:
  // res.cookies.set("token", newAccessToken, { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 3600 });
  return NextResponse.json({ ok: true });
}
