"use client";
import { useCallback, useEffect, useState } from "react";
import type { AdminUser, CreateAdminPayload, UpdateAdminPayload } from "@/types/users";
import type { PaginationMeta } from "@/types/backend-responses";
import { fetchAdmins, createAdmin, updateAdmin, deleteAdmin } from "@/services/users";

const PAGE_SIZE = 10;

export type UseAdminsResult = {
  admins: AdminUser[];
  meta: PaginationMeta | null;
  page: number;
  pageSize: number;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  createAdmin: (payload: CreateAdminPayload) => Promise<AdminUser>;
  updateAdmin: (adminId: string, payload: UpdateAdminPayload) => Promise<AdminUser>;
  deleteAdmin: (adminId: string) => Promise<void>;
};

export function useAdmins(): UseAdminsResult {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPage = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data, meta } = await fetchAdmins({
        limit: PAGE_SIZE,
        offset: (targetPage - 1) * PAGE_SIZE,
      });
      const total = meta.total;
      const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;
      if (targetPage > totalPages && totalPages > 0) {
        setPage(totalPages);
        return;
      }
      setAdmins(data);
      setMeta(meta);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(page);
  }, [loadPage, page]);

  const refresh = useCallback(async () => {
    await loadPage(page);
  }, [loadPage, page]);

  const handleCreate = useCallback(async (payload: CreateAdminPayload) => {
    const created = await createAdmin(payload);
    await refresh();
    return created;
  }, [refresh]);

  const handleUpdate = useCallback(async (adminId: string, payload: UpdateAdminPayload) => {
    const updated = await updateAdmin(adminId, payload);
    await refresh();
    return updated;
  }, [refresh]);

  const handleDelete = useCallback(async (adminId: string) => {
    await deleteAdmin(adminId);
    await refresh();
  }, [refresh]);

  return {
    admins,
    meta,
    page,
    pageSize: PAGE_SIZE,
    loading,
    error,
    refresh,
    setPage,
    createAdmin: handleCreate,
    updateAdmin: handleUpdate,
    deleteAdmin: handleDelete,
  };
}
