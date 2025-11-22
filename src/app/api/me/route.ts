import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";

const BACKEND_URL = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ name: "Usuario" }, { status: 401 });

  try {
    // Si guardamos el nombre en cookie durante el login, úsalo
    const cookieName = cookieStore.get("user_name")?.value;
    if (cookieName && cookieName.trim()) {
      return NextResponse.json({ name: cookieName.trim() });
    }

    // Fallback: intentar decodificar del token (claims name/email)
    const claims = decodeJwt(token) ;
    const derivedName = (claims?.name || claims?.email || "Bienvenido");
    return NextResponse.json({ name: derivedName });
  } catch {
    return NextResponse.json({ name: "Bienvenido" }, { status: 401 });
  }
}
