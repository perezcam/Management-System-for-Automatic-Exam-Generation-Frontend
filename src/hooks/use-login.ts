import { useCallback, useState } from "react";
import type { LoginCredentials } from "@/types/login";
import { login as loginService } from "@/services/auth";

type UseLoginResult = {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  loading: boolean;
  error: string | null;
};

export function useLogin(): UseLoginResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      await loginService(credentials);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "No fue posible iniciar sesión";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, loading, error };
}
