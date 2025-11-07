import { signTestToken } from "../utils/jwt";

// Mock dinámico de cookies() para entregar el token a /api/me
let TEST_TOKEN = "";
jest.mock("next/headers", () => ({
  cookies: () => ({
    get: (name: string) => (name === "token" ? { value: TEST_TOKEN } : undefined),
  }),
}));

describe("GET /api/me", () => {
  beforeEach(() => {
    // Mock global fetch SOLO cuando apunte al BACKEND_URL (simula backend real)
    jest.spyOn(global, "fetch").mockImplementation((input, init?) => {
      const url = typeof input === "string" ? input : input?.toString?.();
      if (url?.startsWith(`${process.env.BACKEND_URL}/api/user/`)) {
        return Promise.resolve(new Response("Mauricio", { status: 200 }));
      }
      // Si /api/me hiciera otra llamada, falla el test para detectarlo
      return Promise.reject(new Error("unexpected fetch: " + url));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("devuelve { name } con token válido", async () => {
    TEST_TOKEN = await signTestToken({ sub: "user123", roles: ["teacher"] });

    // Import tardío para que el mock de next/headers esté activo
    const { GET } = await import("@/app/api/me/route");
    const res = await GET();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toEqual({ name: "Mauricio" });
  });

  it("401 si token inválido o ausente (y name por defecto)", async () => {
    TEST_TOKEN = ""; // sin cookie
    const { GET } = await import("@/app/api/me/route");
    const res = await GET();
    expect([401, 400]).toContain(res.status);

    const data = await res.json();
    expect(data).toHaveProperty("name");
  });
});
