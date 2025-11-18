"use client";

import { useCallback, useEffect, useState } from "react";
import { createQuestionType, deleteQuestionType, fetchQuestionTypes } from "@/services/question-administration/question_types";
import { CreateQuestionTypePayload, QuestionTypeDetail } from "@/types/question-administration/question-type";

export type UseQuestionTypesResult = {
  questionTypes: QuestionTypeDetail[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createQuestionType: (payload: CreateQuestionTypePayload) => Promise<void>;
  deleteQuestionType: (questionTypeId: string) => Promise<void>;
};

export function useQuestionTypes(): UseQuestionTypesResult {
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchQuestionTypes();
      setQuestionTypes(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const handleCreate = useCallback(async (payload: CreateQuestionTypePayload) => {
    const created = await createQuestionType(payload);
    setQuestionTypes(prev => [...prev, created]);
  }, []);

  const handleDelete = useCallback(async (questionTypeId: string) => {
    await deleteQuestionType(questionTypeId);
    setQuestionTypes(prev => prev.filter(t => t.id !== questionTypeId));
  }, []);

  return {
    questionTypes,
    loading,
    error,
    refresh,
    createQuestionType: handleCreate,
    deleteQuestionType: handleDelete,
  };
}
