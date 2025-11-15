export const ADMIN_ENDPOINT = "/api/proxy/users";
export const STUDENT_ENDPOINT = "/api/proxy/student";
export const TEACHER_ENDPOINT = "/api/proxy/teacher";

// Flag global para usar mocks en lugar de backend
export const USE_MOCK_USERS =
  process.env.NEXT_PUBLIC_USE_MOCK_USERS === "true";

// Tamaño de página por defecto
export const DEFAULT_PAGE_SIZE = 20;

// Generador simple de IDs para mocks
export const randomId = () => Math.random().toString(36).slice(2);

export async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return (data)?.message ?? `Error ${response.status}`;
  } catch {
    return response.statusText || "Error de red";
  }
}

// Cliente HTTP común, con cookies y manejo de errores
export async function request<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include", // usa cookie httpOnly con el token
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  if (response.status === 204) {
    // No content
    return undefined as T;
  }

  return (await response.json()) as T;
}

// Si el backend responde { data: T }, extrae; si no, devuelve tal cual
export function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload).data as T;
  }
  return payload as T;
}
