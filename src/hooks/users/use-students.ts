"use client";
import { useCallback, useEffect, useState } from "react";
import type { StudentUser, CreateStudentPayload, UpdateStudentPayload } from "@/types/users/users";
import type { PaginationMeta } from "@/types/backend-responses";
import { fetchStudents, createStudent, updateStudent, deleteStudent } from "@/services/users/student";

const PAGE_SIZE = 10;

export type UseStudentsResult = {
  students: StudentUser[];
  meta: PaginationMeta | null;
  page: number;
  pageSize: number;
  filter: string;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  setFilter: (value: string) => void;
  createStudent: (payload: CreateStudentPayload) => Promise<StudentUser>;
  updateStudent: (studentId: string, payload: UpdateStudentPayload) => Promise<StudentUser>;
  deleteStudent: (studentId: string) => Promise<void>;
};

export function useStudents(): UseStudentsResult {
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilterState] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPage = useCallback(async (targetPage: number, currentFilter: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, meta } = await fetchStudents({
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
      setStudents(data);
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

  const handleCreate = useCallback(async (payload: CreateStudentPayload) => {
    const created = await createStudent(payload);
    await refresh();
    return created;
  }, [refresh]);

  const handleUpdate = useCallback(async (studentId: string, payload: UpdateStudentPayload) => {
    const updated = await updateStudent(studentId, payload);
    await refresh();
    return updated;
  }, [refresh]);

  const handleDelete = useCallback(async (studentId: string) => {
    await deleteStudent(studentId);
    await refresh();
  }, [refresh]);

  return {
    students,
    meta,
    page,
    pageSize: PAGE_SIZE,
    filter,
    loading,
    error,
    refresh,
    setPage,
    setFilter,
    createStudent: handleCreate,
    updateStudent: handleUpdate,
    deleteStudent: handleDelete,
  };
}
