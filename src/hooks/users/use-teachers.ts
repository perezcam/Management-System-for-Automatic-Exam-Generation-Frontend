"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  TeacherUser,
  CreateTeacherPayload,
  UpdateTeacherPayload,
} from "@/types/users";
import {
  fetchTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "@/services/users/teacher-service";

export type UseTeachersResult = {
  teachers: TeacherUser[];
  loading: boolean;
  error: Error | null;

  // paginación
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  goToPage: (page: number) => Promise<void>;

  refresh: () => Promise<void>;
  createTeacher: (payload: CreateTeacherPayload) => Promise<void>;
  updateTeacher: (
    teacherId: string,
    payload: UpdateTeacherPayload
  ) => Promise<void>;
  deleteTeacher: (teacherId: string) => Promise<void>;
};

const PAGE_SIZE = 20;

export function useTeachers(): UseTeachersResult {
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);
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
        const { data, meta } = await fetchTeachers({
          limit: pageSize,
          offset,
        });

        setTeachers(data);
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
    async (payload: CreateTeacherPayload) => {
      try {
        await createTeacher(payload);
        await loadPage(0);
      } catch (err) {
        setError(err as Error);
      }
    },
    [loadPage]
  );

  const handleUpdate = useCallback(
    async (teacherId: string, payload: UpdateTeacherPayload) => {
      try {
        await updateTeacher(teacherId, payload);
        await loadPage(page);
      } catch (err) {
        setError(err as Error);
      }
    },
    [loadPage, page]
  );

  const handleDelete = useCallback(
    async (teacherId: string) => {
      try {
        await deleteTeacher(teacherId);
        await loadPage(page);
      } catch (err) {
        setError(err as Error);
      }
    },
    [loadPage, page]
  );

  return {
    teachers,
    loading,
    error,
    page,
    pageSize,
    total,
    totalPages,
    goToPage,
    refresh,
    createTeacher: handleCreate,
    updateTeacher: handleUpdate,
    deleteTeacher: handleDelete,
  };
}
