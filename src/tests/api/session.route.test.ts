import { signTestToken } from "../utils/jwt";

// Ajusta el import a tu ruta real:
import { POST } from "@/app/api/session/route";

describe("POST /api/session", () => {
  it("devuelve 400 si falta token", async () => {
    const req = new Request("http://localhost/api/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("setea cookie httpOnly con el token válido", async () => {
    const token = await signTestToken();

    const req = new Request("http://localhost/api/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const setCookie = res.headers.get("set-cookie") || "";
    expect(setCookie).toMatch(/token=/i);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/Path=\//i);
  });
});
