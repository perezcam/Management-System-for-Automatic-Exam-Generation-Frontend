"use client";
import { useCallback, useEffect, useState } from "react";
import type { TeacherUser, CreateTeacherPayload, UpdateTeacherPayload } from "@/types/users";
import type { PaginationMeta } from "@/types/backend-responses";
import { fetchTeachers, createTeacher, updateTeacher, deleteTeacher } from "@/services/users";

const PAGE_SIZE = 10;

export type UseTeachersResult = {
  teachers: TeacherUser[];
  meta: PaginationMeta | null;
  page: number;
  pageSize: number;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  createTeacher: (payload: CreateTeacherPayload) => Promise<TeacherUser>;
  updateTeacher: (teacherId: string, payload: UpdateTeacherPayload) => Promise<TeacherUser>;
  deleteTeacher: (teacherId: string) => Promise<void>;
};

export function useTeachers(): UseTeachersResult {
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPage = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data, meta } = await fetchTeachers({
        limit: PAGE_SIZE,
        offset: (targetPage - 1) * PAGE_SIZE,
      });
      const total = meta.total;
      const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;
      if (targetPage > totalPages && totalPages > 0) {
        setPage(totalPages);
        return;
      }
      setTeachers(data);
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

  const handleCreate = useCallback(async (payload: CreateTeacherPayload) => {
    const created = await createTeacher(payload);
    await refresh();
    return created;
  }, [refresh]);

  const handleUpdate = useCallback(async (teacherId: string, payload: UpdateTeacherPayload) => {
    const updated = await updateTeacher(teacherId, payload);
    await refresh();
    return updated;
  }, [refresh]);

  const handleDelete = useCallback(async (teacherId: string) => {
    await deleteTeacher(teacherId);
    await refresh();
  }, [refresh]);

  return {
    teachers,
    meta,
    page,
    pageSize: PAGE_SIZE,
    loading,
    error,
    refresh,
    setPage,
    createTeacher: handleCreate,
    updateTeacher: handleUpdate,
    deleteTeacher: handleDelete,
  };
}
