import { useCallback, useEffect, useState } from "react";
import type { AdminUser, CreateAdminPayload, UpdateAdminPayload } from "@/types/user/admin";
import {
  createAdmin as createAdminService,
  deleteAdmin as deleteAdminService,
  fetchAdmins,
  updateAdmin as updateAdminService,
} from "@/services/administration/users/admin";

type UseAdminUsersResult = {
  admins: AdminUser[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createAdmin: (payload: CreateAdminPayload) => Promise<void>;
  updateAdmin: (adminId: string, payload: UpdateAdminPayload) => Promise<void>;
  deleteAdmin: (adminId: string) => Promise<void>;
};

export const useAdminUsers = (): UseAdminUsersResult => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdmins();
      setAdmins(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdmins();
  }, [loadAdmins]);

  const handleCreateAdmin = useCallback(async (payload: CreateAdminPayload) => {
    const created = await createAdminService(payload);
    setAdmins((prev) => [...prev, created]);
  }, []);

  const handleUpdateAdmin = useCallback(async (adminId: string, payload: UpdateAdminPayload) => {
    const updated = await updateAdminService(adminId, payload);
    setAdmins((prev) => prev.map((admin) => (admin.id === adminId ? updated : admin)));
  }, []);

  const handleDeleteAdmin = useCallback(async (adminId: string) => {
    await deleteAdminService(adminId);
    setAdmins((prev) => prev.filter((admin) => admin.id !== adminId));
  }, []);

  return {
    admins,
    loading,
    error,
    refresh: loadAdmins,
    createAdmin: handleCreateAdmin,
    updateAdmin: handleUpdateAdmin,
    deleteAdmin: handleDeleteAdmin,
  };
};
