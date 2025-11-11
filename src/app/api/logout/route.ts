import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Ajusta el nombre a tu cookie real (p. ej. "token", "auth_token", etc.)
const COOKIE_NAME = "token";

export async function POST() {
  // 1) opción directa: borrar del store
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);

  // 2) opción “belt and suspenders”: setear vencida (por si domain/path difieren)
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",           
    maxAge: 0,
    expires: new Date(0),
  });
  return res;
}
