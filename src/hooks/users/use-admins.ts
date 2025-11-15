"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AdminUser,
  CreateAdminPayload,
  UpdateAdminPayload,
} from "@/types/users";
import {
  fetchAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "@/services/users/admin-service";

export type UseAdminsResult = {
  admins: AdminUser[];
  loading: boolean;
  error: Error | null;

  // paginación
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  goToPage: (page: number) => Promise<void>;

  refresh: () => Promise<void>;
  createAdmin: (payload: CreateAdminPayload) => Promise<void>;
  updateAdmin: (adminId: string, payload: UpdateAdminPayload) => Promise<void>;
  deleteAdmin: (adminId: string) => Promise<void>;
};

const PAGE_SIZE = 20;

export function useAdmins(): UseAdminsResult {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = PAGE_SIZE;

  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;

  const loadPage = useCallback(
    async (pageToLoad: number) => {
      setLoading(true);
      setError(null);

      const offset = pageToLoad * pageSize;

      try {
        const { data, meta } = await fetchAdmins({
          limit: pageSize,
          offset,
        });

        setAdmins(data);
        setTotal(meta.total);
        setPage(pageToLoad);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    void loadPage(0);
  }, [loadPage]);

  const refresh = useCallback(async () => {
    await loadPage(page);
  }, [loadPage, page]);

  const goToPage = useCallback(
    async (newPage: number) => {
      if (newPage < 0 || newPage >= totalPages) return;
      await loadPage(newPage);
    },
    [loadPage, totalPages]
  );

  const handleCreate = useCallback(
    async (payload: CreateAdminPayload) => {
      try {
        await createAdmin(payload);
        await loadPage(0);
      } catch (err) {
        setError(err as Error);
      }
    },
    [loadPage]
  );

  const handleUpdate = useCallback(
    async (adminId: string, payload: UpdateAdminPayload) => {
      try {
        await updateAdmin(adminId, payload);
        await loadPage(page);
      } catch (err) {
        setError(err as Error);
      }
    },
    [loadPage, page]
  );

  const handleDelete = useCallback(
    async (adminId: string) => {
      try {
        await deleteAdmin(adminId);
        await loadPage(page);
      } catch (err) {
        setError(err as Error);
      }
    },
    [loadPage, page]
  );

  return {
    admins,
    loading,
    error,
    page,
    pageSize,
    total,
    totalPages,
    goToPage,
    refresh,
    createAdmin: handleCreate,
    updateAdmin: handleUpdate,
    deleteAdmin: handleDelete,
  };
}
