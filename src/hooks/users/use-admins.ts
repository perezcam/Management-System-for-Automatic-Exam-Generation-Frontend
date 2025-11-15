"use client";
import { useCallback, useEffect, useState } from "react";
import type { AdminUser, CreateAdminPayload, UpdateAdminPayload } from "@/types/users";
import { fetchAdmins, createAdmin, updateAdmin, deleteAdmin } from "@/services/users/admin-service";

export type UseAdminsResult = {
  admins: AdminUser[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createAdmin: (payload: CreateAdminPayload) => Promise<void>;
  updateAdmin: (adminId: string, payload: UpdateAdminPayload) => Promise<void>;
  deleteAdmin: (adminId: string) => Promise<void>;
};

export function useAdmins(): UseAdminsResult {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
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
    void refresh();
  }, [refresh]);

  const handleCreate = useCallback(async (payload: CreateAdminPayload) => {
    const created = await createAdmin(payload);
    setAdmins(prev => [...prev, created]);
  }, []);

  const handleUpdate = useCallback(async (adminId: string, payload: UpdateAdminPayload) => {
    const updated = await updateAdmin(adminId, payload);
    setAdmins(prev => prev.map(a => (a.id === adminId ? updated : a)));
  }, []);

  const handleDelete = useCallback(async (adminId: string) => {
    await deleteAdmin(adminId);
    setAdmins(prev => prev.filter(a => a.id !== adminId));
  }, []);

  return {
    admins,
    loading,
    error,
    refresh,
    createAdmin: handleCreate,
    updateAdmin: handleUpdate,
    deleteAdmin: handleDelete,
  };
}
