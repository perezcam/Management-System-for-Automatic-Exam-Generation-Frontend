"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  CreateSubjectPayload, SubjectDetail, UpdateSubjectPayload
} from "@/types/question_administration";
import { createSubject, deleteSubject, fetchSubjects, updateSubject } from "@/services/question-administration/subjects";


export type UseSubjectResult = {
  subjects: SubjectDetail[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createSubject: (payload: CreateSubjectPayload) => Promise<void>;
  updateSubject: (subjectId: string, payload: UpdateSubjectPayload) => Promise<void>;
  deleteSubject: (subjectId: string) => Promise<void>;

  __setSubjects: React.Dispatch<React.SetStateAction<SubjectDetail[]>>;
};

export function useSubject(): UseSubjectResult {
  const [subjects, __setSubjects] = useState<SubjectDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSubjects();
      __setSubjects(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const handleCreate = useCallback(async (payload: CreateSubjectPayload) => {
    const created = await createSubject(payload);
    __setSubjects(prev => [...prev, created]);
  }, []);

  const handleUpdate = useCallback(async (subjectId: string, payload: UpdateSubjectPayload) => {
    const updated = await updateSubject(subjectId, payload);
    __setSubjects(prev => prev.map(s => s.subject_id === subjectId ? updated : s));
  }, []);

  const handleDelete = useCallback(async (subjectId: string) => {
    await deleteSubject(subjectId);
    __setSubjects(prev => prev.filter(s => s.subject_id !== subjectId));
  }, []);

  return {
    subjects,
    loading,
    error,
    refresh,
    createSubject: handleCreate,
    updateSubject: handleUpdate,
    deleteSubject: handleDelete,
    __setSubjects,
  };
}
