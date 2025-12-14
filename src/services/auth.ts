import { LoginCredentials } from "@/types/login";
import type { RetrieveOneSchema } from "@/types/backend-responses";
import { backendRequest } from "@/services/api-client";

type LoginData = {
  token?: string;
  user?: { id?: string; name?: string; email?: string; role?: string };
};

async function requestBackendToken({ email, password }: LoginCredentials): Promise<{ token: string; userName?: string }> {
  const url = "/api/proxy/login";
  const response = await backendRequest<RetrieveOneSchema<LoginData>>(url, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, { skipAuthRedirect: true });

  const token = response.data?.token;
  if (!token) throw new Error("El backend no devolvió un token válido");

  const userName = response.data?.user?.name;
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
