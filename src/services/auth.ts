import { LoginCredentials } from "@/types/login";
import { get_login_url } from "@/config/backend";

async function requestBackendToken({ email, password }: LoginCredentials): Promise<string> {
  const searchParams = new URLSearchParams({ email, password });
  const url = `${get_login_url()}?${searchParams.toString()}`;

  const response = await fetch(url, { method: "GET" });
  if (!response.ok) throw new Error("Credenciales inválidas o backend no disponible");

  const data = (await response.json()) as { token?: string };
  if (!data.token) throw new Error("El backend no devolvió un token válido");

  return data.token;
}

async function persistSessionCookie(token: string) {
  const response = await fetch("/api/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token }),
    credentials: "include",
  });

  if (!response.ok) throw new Error("No fue posible guardar la sesión");
}

export async function login(credentials: LoginCredentials) {
  const token = await requestBackendToken(credentials);
  await persistSessionCookie(token);
}
