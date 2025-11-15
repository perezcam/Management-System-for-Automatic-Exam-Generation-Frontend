export const ADMIN_ENDPOINT = "/api/proxy/users";
export const STUDENT_ENDPOINT = "/api/proxy/student";
export const TEACHER_ENDPOINT = "/api/proxy/teacher";

// Flag global para usar mocks
export const USE_MOCK_USERS =
  process.env.NEXT_PUBLIC_USE_MOCK_USERS === "true";

// Generador simple de IDs para mocks
export const randomId = () => Math.random().toString(36).slice(2);

// Cliente HTTP común, con cookies y manejo de errores
export const request = async <T>(
  url: string,
  init?: RequestInit
): Promise<T> => {
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

  // No content
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

// Si el backend responde { data: T }, extrae; si no, devuelve tal cual
export const unwrap = <T>(payload: unknown): T =>
  payload && typeof payload === "object" && "data" in payload
    ? ((payload).data as T)
    : (payload as T);

export const extractErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    return (data)?.message ?? `Error ${response.status}`;
  } catch {
    return response.statusText || "Error de red";
  }
};
