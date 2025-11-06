import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ name: "Usuario" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    const userId = payload.sub as string | undefined;
    if (!userId) return NextResponse.json({ name: "Usuario" }, { status: 400 });

    const resp = await fetch(`${process.env.BACKEND_URL}/api/user/${userId}`, {
      cache: "no-store",
    });
    if (!resp.ok) return NextResponse.json({ name: "Usuario" }, { status: resp.status });

    const name = (await resp.text()).trim(); 
    return NextResponse.json({ name: name || "Usuario" });
  } catch {
    return NextResponse.json({ name: "Usuario" }, { status: 401 });
  }
}
