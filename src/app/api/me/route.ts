import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token || !ACCESS_SECRET) return NextResponse.json({ name: "Usuario" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(ACCESS_SECRET)
    );

    const userId = payload.sub as string | undefined;
    if (!userId) return NextResponse.json({ name: "Bienvenido" }, { status: 400 });

    const resp = await fetch(`${process.env.BACKEND_URL}/api/user/${userId}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/plain",
      },
    });

    if (!resp.ok) return NextResponse.json({ name: "Bienvenido" }, { status: resp.status });

    const name = (await resp.text()).trim();
    return NextResponse.json({ name: name || "Bienvenido" });
  } catch {
    return NextResponse.json({ name: "Bienvenido" }, { status: 401 });
  }
}
