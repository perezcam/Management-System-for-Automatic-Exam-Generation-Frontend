import { NextResponse } from "next/server";
import { decodeJwt } from "jose";

const COOKIE_NAME = "token";

// En dev confiamos en el token emitido por el backend y solo lo decodificamos
// para alinear la expiración de la cookie. No validamos firma aquí.

export async function POST(req: Request) {
  const { token, userName } = await req.json();
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Token requerido" }, { status: 400 });
  }

  // 1) Alinear caducidad de la cookie al `exp` del token (sin verificar firma)
  let maxAge: number | undefined;
  try {
    const payload = decodeJwt(token);
    if (typeof payload.exp === "number") {
      const secondsLeft = payload.exp - Math.floor(Date.now() / 1000);
      if (secondsLeft > 0) {
        maxAge = secondsLeft;
      }
    }
  } catch (_) {
    // si no se puede decodificar, seguimos sin maxAge
  }

  // 2) Guardar cookie httpOnly
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    ...(maxAge ? { maxAge } : {}), 
  });

  // Guardar nombre si viene del backend (httpOnly también; el cliente lo leerá via /api/me)
  if (typeof userName === "string" && userName.trim()) {
    res.cookies.set("user_name", userName.trim(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      ...(maxAge ? { maxAge } : {}),
    });
  }

  return res;
}
