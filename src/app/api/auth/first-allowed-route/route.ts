import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firstAllowedRouteFor } from "@/utils/access";
import { getRolesFromToken } from "@/utils/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ path: "/login" }, { status: 200 });
  }

  const roles = await getRolesFromToken(token);
  const path = firstAllowedRouteFor(roles);

  return NextResponse.json({ path }, { status: 200 });
}
