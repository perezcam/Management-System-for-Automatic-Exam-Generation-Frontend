import type { BaseResponse } from "@/types/backend-responses";
import { decodeBackendSchema, extractBackendMessage } from "@/utils/backend-response";
import { showErrorToast } from "@/utils/toast";

const DEFAULT_SUCCESS: BaseResponse = {
  success: true,
  message: "Operación exitosa",
};

export async function backendRequest<TSchema extends BaseResponse>(
  url: string,
  init?: RequestInit,
): Promise<TSchema> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      credentials: "include",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No fue posible contactar al backend";
    showErrorToast(message);
    throw err;
  }

  if (response.status === 204) {
    return DEFAULT_SUCCESS as TSchema;
  }

  const payload = await parseResponseJson(response);

  if (!response.ok) {
    if (shouldForceLogin(response.status)) {
      await handleExpiredSession();
    }
    const fallbackMessage = response.statusText || `Error ${response.status}`;
    const message = extractBackendMessage(payload) ?? fallbackMessage;
    showErrorToast(message);
    throw new Error(message);
  }

  return decodeBackendSchema<TSchema>(payload);
}

export async function backendRequestRaw<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      credentials: "include",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No fue posible contactar al backend";
    showErrorToast(message);
    throw err;
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const payload = await parseResponseJson(response);

  if (!response.ok) {
    if (shouldForceLogin(response.status)) {
      await handleExpiredSession();
    }
    const fallbackMessage = response.statusText || `Error ${response.status}`;
    const message = extractBackendMessage(payload) ?? fallbackMessage;
    showErrorToast(message);
    throw new Error(message);
  }

  return payload as T;
}

const parseResponseJson = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const shouldForceLogin = (status: number) => status === 401 || status === 419 || status === 440;

async function handleExpiredSession() {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Ignoramos errores al intentar cerrar sesion
  }

  const { pathname, search } = window.location;
  const next = encodeURIComponent(`${pathname}${search}`);
  window.location.assign(`/login?next=${next}`);
}
