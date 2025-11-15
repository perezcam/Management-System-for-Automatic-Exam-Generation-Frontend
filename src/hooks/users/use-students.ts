"use client";
import { useCallback, useEffect, useState } from "react";
import type { StudentUser, CreateStudentPayload, UpdateStudentPayload } from "@/types/users";
import type { PaginationMeta } from "@/types/backend-responses";
import { fetchStudents, createStudent, updateStudent, deleteStudent } from "@/services/users";

const PAGE_SIZE = 10;

export type UseStudentsResult = {
  students: StudentUser[];
  meta: PaginationMeta | null;
  page: number;
  pageSize: number;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  createStudent: (payload: CreateStudentPayload) => Promise<StudentUser>;
  updateStudent: (studentId: string, payload: UpdateStudentPayload) => Promise<StudentUser>;
  deleteStudent: (studentId: string) => Promise<void>;
};

export function useStudents(): UseStudentsResult {
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPage = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data, meta } = await fetchStudents({
        limit: PAGE_SIZE,
        offset: (targetPage - 1) * PAGE_SIZE,
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
    void loadPage(page);
  }, [loadPage, page]);

  const refresh = useCallback(async () => {
    await loadPage(page);
  }, [loadPage, page]);

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
    loading,
    error,
    refresh,
    setPage,
    createStudent: handleCreate,
    updateStudent: handleUpdate,
    deleteStudent: handleDelete,
  };
}
