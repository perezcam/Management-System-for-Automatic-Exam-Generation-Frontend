import { NextResponse } from "next/server";
import { SignJWT } from "jose";

const COOKIE_NAME = "token";

export async function POST(req: Request) {
  const { token, sub, role, expiresIn = "1h" } = await req.json();

  let jwt = token as string | undefined;

  if (!jwt) {
    if (!sub || !role) {
      return NextResponse.json({ error: "Faltan campos para firmar token (sub, role)" }, { status: 400 });
    }
    jwt = await new SignJWT({ sub, role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expiresIn) 
      .sign(new TextEncoder().encode(process.env.JWT_SECRET!));
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60, //1 hora
  });
  return res;
}
