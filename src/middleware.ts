import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { allowedRoutesFor, canAccess, type Role } from "@/utils/access";

const COOKIE_NAME = "token";
const LOGIN_PATH = "/login";

async function getRoleFromToken(cookieToken?: string): Promise<Role | null> {
  if (!cookieToken) return null;
  try {
    const { payload } = await jwtVerify(
      cookieToken,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    return (payload.role as Role | undefined) ?? null;
  } catch {
    return null; 
  }
}

function firstAllowedOrUnauthorizedUrl(req: NextRequest, role: Role | null) {
  const first = allowedRoutesFor(role)[0];
  const url = req.nextUrl.clone();
  if (first) {
    url.pathname = first;
    url.search = "";
    return url;
  }
  url.pathname = "/unauthorized";
  url.search = "";
  return url;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const role = await getRoleFromToken(token);

  if (!role) {
    const url = req.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (!canAccess(pathname, role)) {
    const url = firstAllowedOrUnauthorizedUrl(req, role);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/pending_exams",
    "/pending_exams/:path*",
    "/messaging",
    "/messaging/:path*",
    "/statistics",
    "/statistics/:path*",
    "/administration",
    "/administration/:path*",
    "/exam_bank",
    "/exam_bank/:path*",
    "/question_generator",
    "/question_generator/:path*",
    "/exam_generator",
    "/exam_generator/:path*",
    "/question_bank",
    "/question_bank/:path*",
    "/configuration",
    "/configuration/:path*",
    "/subjects",
    "/subjects/:path*",
    "/exams",
    "/exams/:path*",
  ],
};
