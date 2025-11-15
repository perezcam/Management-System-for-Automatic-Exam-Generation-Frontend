"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  StudentUser,
  CreateStudentPayload,
  UpdateStudentPayload,
} from "@/types/users";
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/services/users/student-service";

export type UseStudentsResult = {
  students: StudentUser[];
  loading: boolean;
  error: Error | null;

  // paginación
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  goToPage: (page: number) => Promise<void>;

  refresh: () => Promise<void>;
  createStudent: (payload: CreateStudentPayload) => Promise<void>;
  updateStudent: (
    studentId: string,
    payload: UpdateStudentPayload
  ) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
};

const PAGE_SIZE = 20;

export function useStudents(): UseStudentsResult {
  const [students, setStudents] = useState<StudentUser[]>([]);
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
        const { data, meta } = await fetchStudents({
          limit: pageSize,
          offset,
        });

        setStudents(data);
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

  // primera carga
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
    async (payload: CreateStudentPayload) => {
      try {
        await createStudent(payload);
        // tras crear, recargamos la primera página
        await loadPage(0);
      } catch (err) {
        setError(err as Error);
      }
    },
    [loadPage]
  );

  const handleUpdate = useCallback(
    async (studentId: string, payload: UpdateStudentPayload) => {
      try {
        await updateStudent(studentId, payload);
        await loadPage(page);
      } catch (err) {
        setError(err as Error);
      }
    },
    [loadPage, page]
  );

  const handleDelete = useCallback(
    async (studentId: string) => {
      try {
        await deleteStudent(studentId);
        await loadPage(page);
      } catch (err) {
        setError(err as Error);
      }
    },
    [loadPage, page]
  );

  return {
    students,
    loading,
    error,
    page,
    pageSize,
    total,
    totalPages,
    goToPage,
    refresh,
    createStudent: handleCreate,
    updateStudent: handleUpdate,
    deleteStudent: handleDelete,
  };
}
