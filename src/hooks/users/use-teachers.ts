"use client";
import { useCallback, useEffect, useState } from "react";
import type { TeacherUser, CreateTeacherPayload, UpdateTeacherPayload } from "@/types/users/users";
import type { PaginationMeta } from "@/types/backend-responses";
import { fetchTeachers, createTeacher, updateTeacher, deleteTeacher } from "@/services/users/teachers";

const PAGE_SIZE = 10;

export type UseTeachersResult = {
  teachers: TeacherUser[];
  meta: PaginationMeta | null;
  page: number;
  pageSize: number;
  filter: string;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  setFilter: (value: string) => void;
  createTeacher: (payload: CreateTeacherPayload) => Promise<TeacherUser>;
  updateTeacher: (teacherId: string, payload: UpdateTeacherPayload) => Promise<TeacherUser>;
  deleteTeacher: (teacherId: string) => Promise<void>;
};

export function useTeachers(): UseTeachersResult {
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilterState] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPage = useCallback(async (targetPage: number, currentFilter: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, meta } = await fetchTeachers({
        limit: PAGE_SIZE,
        offset: (targetPage - 1) * PAGE_SIZE,
        filter: currentFilter || undefined,
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
    void loadPage(page, filter);
  }, [loadPage, page, filter]);

  const refresh = useCallback(async () => {
    await loadPage(page, filter);
  }, [loadPage, page, filter]);

  const setFilter = useCallback((value: string) => {
    setPage(1);
    setFilterState(value);
  }, []);

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
    filter,
    loading,
    error,
    refresh,
    setPage,
    setFilter,
    createTeacher: handleCreate,
    updateTeacher: handleUpdate,
    deleteTeacher: handleDelete,
  };
}
