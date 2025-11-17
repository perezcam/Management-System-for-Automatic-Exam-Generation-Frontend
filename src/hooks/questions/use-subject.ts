"use client";

import { useCallback, useEffect, useState } from "react";

import {
  addTopicToSubject,
  createSubject,
  deleteSubject,
  fetchSubjects,
  removeTopicFromSubject,
  updateSubject,
} from "@/services/question-administration/subjects";
import { CreateSubjectPayload, SubjectDetail, UpdateSubjectPayload } from "@/types/question-administration/subject";


const PAGE_SIZE = 2;

export type UseSubjectResult = {
  subjects: SubjectDetail[];
  page: number;
  pageSize: number;
  total: number | null;
  filter: string;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  setFilter: (value: string) => void;
  createSubject: (payload: CreateSubjectPayload) => Promise<void>;
  updateSubject: (subjectId: string, payload: UpdateSubjectPayload) => Promise<void>;
  deleteSubject: (subjectId: string) => Promise<void>;
  attachTopicToSubject: (subjectId: string, topicId: string) => Promise<void>;
  detachTopicFromSubject: (subjectId: string, topicId: string) => Promise<void>;

  __setSubjects: React.Dispatch<React.SetStateAction<SubjectDetail[]>>;
};

export function useSubject(): UseSubjectResult {
  const [subjects, __setSubjects] = useState<SubjectDetail[]>([]);
  const [page, setPageState] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
   const [filter, setFilterState] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSubjects(filter ? { q: filter } : undefined);
      __setSubjects(data);
      setTotal(data.length);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { void refresh(); }, [refresh]);

  const setPage = useCallback((nextPage: number) => {
    setPageState(nextPage < 1 ? 1 : nextPage);
  }, []);

  const setFilter = useCallback((value: string) => {
    setPageState(1);
    setFilterState(value);
  }, []);

  const handleCreate = useCallback(async (payload: CreateSubjectPayload) => {
    const created = await createSubject(payload);
    __setSubjects(prev => [...prev, created]);
    setTotal((prev) => (typeof prev === "number" ? prev + 1 : prev));
  }, []);

  const handleUpdate = useCallback(async (subjectId: string, payload: UpdateSubjectPayload) => {
    const updated = await updateSubject(subjectId, payload);
    __setSubjects(prev => prev.map(s => s.subject_id === subjectId ? updated : s));
  }, []);

  const handleDelete = useCallback(async (subjectId: string) => {
    await deleteSubject(subjectId);
    __setSubjects(prev => prev.filter(s => s.subject_id !== subjectId));
    setTotal((prev) => (typeof prev === "number" ? Math.max(0, prev - 1) : prev));
  }, []);

  const handleAttachTopic = useCallback(async (subjectId: string, topicId: string) => {
    await addTopicToSubject(subjectId, topicId);
    const data = await fetchSubjects(filter ? { q: filter } : undefined);
    __setSubjects(data);
    setTotal(data.length);
  }, [filter]);

  const handleDetachTopic = useCallback(async (subjectId: string, topicId: string) => {
    await removeTopicFromSubject(subjectId, topicId);
    const data = await fetchSubjects(filter ? { q: filter } : undefined);
    __setSubjects(data);
    setTotal(data.length);
  }, [filter]);

  return {
    subjects,
    page,
    pageSize: PAGE_SIZE,
    total,
    filter,
    loading,
    error,
    refresh,
    setPage,
    setFilter,
    createSubject: handleCreate,
    updateSubject: handleUpdate,
    deleteSubject: handleDelete,
    attachTopicToSubject: handleAttachTopic,
    detachTopicFromSubject: handleDetachTopic,
    __setSubjects,
  };
}
