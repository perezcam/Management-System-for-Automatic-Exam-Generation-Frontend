import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { allowedRoutesFor, canAccess, type Role } from "@/utils/access";
import {getRolesFromToken} from "@/utils/auth";
const COOKIE_NAME = "token";
const LOGIN_PATH = "/login";

function firstAllowedUrl(req: NextRequest, roles: Role[]) {
  const first = allowedRoutesFor(roles)[0];
  const url = req.nextUrl.clone();
  url.pathname = first ?? "/unauthorized";
  url.search = "";
  return url;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) Autenticación
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const roles = await getRolesFromToken(token);

  if (!roles.length) {
    const url = req.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 2) Autorización por roles
  if (!canAccess(pathname, roles)) {
    return NextResponse.redirect(firstAllowedUrl(req, roles));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/pending_exams","/pending_exams/:path*",
    "/administration","/administration/:path*",
    "/exam_bank","/exam_bank/:path*",
    "/question_bank","/question_bank/:path*",
    "/regrade","/regrade/:path*",
    "/exams","/exams/:path*",
    "/reports","/reports/:path*",
  ],
};
