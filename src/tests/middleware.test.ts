import { NextRequest } from "next/server";
import { signTestToken } from "./utils/jwt";
import { describe, it, expect } from '@jest/globals';

// Ajusta el import a tu archivo real de middleware:
import { middleware } from "@/middleware";

function reqWithCookie(path: string, cookie?: string) {
  return new NextRequest(`http://localhost${path}`, {
    headers: cookie ? { cookie } : {},
  });
}

describe("middleware auth/roles", () => {
  it("redirige a /login si no hay token", async () => {
    const req = reqWithCookie("/messaging");
    const res = await middleware(req);
    expect(res?.headers.get("location")).toMatch(/\/login\?next=%2Fmessaging$/);
  });

  it("permite acceso si el rol puede entrar a la ruta", async () => {
    const token = await signTestToken({ sub: "user1", roles: ["teacher"] });
    const req = reqWithCookie("/messaging", `token=${token}`);
    const res = await middleware(req);
    // NextResponse.next() suele añadir esta cabecera
    expect(res?.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirige a primera ruta permitida si no puede entrar", async () => {
    // 'teacher' NO puede entrar a '/administration' según tu ROLE_ALLOWED_KEYS
    const token = await signTestToken({ sub: "user1", roles: ["teacher"] });
    const req = reqWithCookie("/administration", `token=${token}`);
    const res = await middleware(req);
    expect(res?.headers.get("location")).toBe("http://localhost/messaging");
  });
});
