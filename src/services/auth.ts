import { LoginCredentials } from "@/types/login";

type LoginResponse = {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    user?: { id?: string; name?: string; email?: string; role?: string };
  };
};

async function requestBackendToken({ email, password }: LoginCredentials): Promise<{ token: string; userName?: string }> {
  const url = "/api/proxy/login";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  let payload: LoginResponse | null = null;
  try {
    payload = (await response.json()) as LoginResponse;
  } catch {
    // No JSON válido
  }

  if (!response.ok) {
    const message = payload?.message || "Credenciales inválidas o backend no disponible";
    throw new Error(message);
  }

  const token = payload?.data?.token;
  if (!token) throw new Error("El backend no devolvió un token válido");

  const userName = payload?.data?.user?.name;
  return { token, userName };
}

async function persistSessionCookie(token: string, userName?: string) {
  const response = await fetch("/api/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token, userName }),
    credentials: "include",
  });

  if (!response.ok) throw new Error("No fue posible guardar la sesión");
}

export async function login(credentials: LoginCredentials) {
  const { token, userName } = await requestBackendToken(credentials);
  await persistSessionCookie(token, userName);
}
