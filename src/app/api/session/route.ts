import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "token";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const SECRET = ACCESS_SECRET ? new TextEncoder().encode(ACCESS_SECRET) : undefined;
const ISSUER = process.env.JWT_ISSUER;
const AUDIENCE = process.env.JWT_AUDIENCE;

export async function POST(req: Request) {
  if (!SECRET) {
    return NextResponse.json({ error: "Configura JWT_ACCESS_SECRET" }, { status: 500 });
  }
  const { token } = await req.json();
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Token requerido" }, { status: 400 });
  }

  // 1) Verificar firma y claims
  let payload;
  try {
    const verified = await jwtVerify(token, SECRET, {
      issuer: ISSUER,        
      audience: AUDIENCE,      
      clockTolerance: 10,  
    });
    payload = verified.payload;
  } catch (err) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  // 2) Alinear caducidad de la cookie al `exp` del token
  let maxAge: number | undefined;
  if (typeof payload.exp === "number") {
    const secondsLeft = payload.exp - Math.floor(Date.now() / 1000);
    if (secondsLeft <= 0) {
      return NextResponse.json({ error: "Token expirado" }, { status: 400 });
    }
    maxAge = secondsLeft;
  }

  // 3) Guardar cookie httpOnly
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    ...(maxAge ? { maxAge } : {}), 
  });

  return res;
}
