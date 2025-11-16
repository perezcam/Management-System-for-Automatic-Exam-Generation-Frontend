"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  CreateSubjectPayload,
  SubjectDetail,
  UpdateSubjectPayload,
} from "@/types/question_administration";
import {
  fetchSubjectsPaginated,
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/services/question-adm/subjects-service";

const PAGE_SIZE = 20;

export type UseSubjectResult = {
  subjects: SubjectDetail[];
  loading: boolean;
  error: Error | null;

  // paginación
  page: number;          // índice 0-based
  pageSize: number;      // casi siempre 20
  total: number;         // total de materias en BD
  totalPages: number;    // Math.ceil(total / pageSize)
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;

  refresh: () => Promise<void>;
  createSubject: (payload: CreateSubjectPayload) => Promise<void>;
  updateSubject: (
    subjectId: string,
    payload: UpdateSubjectPayload
  ) => Promise<void>;
  deleteSubject: (subjectId: string) => Promise<void>;

  __setSubjects: React.Dispatch<React.SetStateAction<SubjectDetail[]>>;
};

export function useSubject(): UseSubjectResult {
  const [subjects, __setSubjects] = useState<SubjectDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [page, setPage] = useState(0);
  const pageSize = PAGE_SIZE;
  const [total, setTotal] = useState(0);
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;

  const loadPage = useCallback(
    async (pageToLoad: number) => {
      setLoading(true);
      setError(null);

      const offset = pageToLoad * pageSize;

      try {
        const { data, meta } = await fetchSubjectsPaginated({
          limit: pageSize,
          offset,
        });

        __setSubjects(data);
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

  const nextPage = useCallback(async () => {
    if (page >= totalPages - 1) return;
    await loadPage(page + 1);
  }, [page, totalPages, loadPage]);

  const prevPage = useCallback(async () => {
    if (page <= 0) return;
    await loadPage(page - 1);
  }, [page, loadPage]);

  const handleCreate = useCallback(
    async (payload: CreateSubjectPayload) => {
      await createSubject(payload);
      await loadPage(0);
    },
    [loadPage]
  );

  const handleUpdate = useCallback(
    async (subjectId: string, payload: UpdateSubjectPayload) => {
      await updateSubject(subjectId, payload);
      await loadPage(page);
    },
    [loadPage, page]
  );

  const handleDelete = useCallback(
    async (subjectId: string) => {
      await deleteSubject(subjectId);

      const isLastInPage = subjects.length === 1 && page > 0;
      const targetPage = isLastInPage ? page - 1 : page;
      await loadPage(targetPage);
    },
    [deleteSubject, loadPage, page, subjects.length]
  );

  return {
    subjects,
    loading,
    error,
    page,
    pageSize,
    total,
    totalPages,
    nextPage,
    prevPage,
    refresh,
    createSubject: handleCreate,
    updateSubject: handleUpdate,
    deleteSubject: handleDelete,
    __setSubjects,
  };
}
