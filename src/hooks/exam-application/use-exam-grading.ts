"use client";

import { useCallback, useEffect, useState } from "react";
import { ExamApplicationService } from "@/services/exam-application/exam-application-service";
import { ActiveExam, ExamResponse } from "@/types/exam-application/exam";
import type { QuestionDetail } from "@/types/question-bank/question";
import { showError } from "@/utils/toast";

export function useExamGrading(assignmentId?: string, examId?: string, studentId?: string) {
  const [exam, setExam] = useState<ActiveExam | null>(null);
  const [responses, setResponses] = useState<Record<string, ExamResponse | null>>({});
  const [questionDetails, setQuestionDetails] = useState<Record<string, QuestionDetail | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingQuestionId, setLoadingQuestionId] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setExam(null);
    setResponses({});
    setQuestionDetails({});
  }, []);

  useEffect(() => {
    resetState();
  }, [assignmentId, examId, resetState]);

  const fetchExam = useCallback(async () => {
    if (!examId) return;
    setLoading(true);
    setError(null);
    try {
      const examResp = await ExamApplicationService.getExam(examId);
      setExam(examResp.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    void fetchExam();
  }, [fetchExam]);

  const loadQuestionAssets = useCallback(
    async (questionId: string, questionIndex: number, options: { force?: boolean } = {}) => {
      if (!examId) return null;
      const force = options.force ?? false;

      setLoadingQuestionId(questionId);
      setQuestionError(null);
      try {
        const [detail, response] = await Promise.all([
          questionDetails[questionId] !== undefined
            ? Promise.resolve(questionDetails[questionId])
            : ExamApplicationService.getQuestionByIndex(examId, questionIndex),
          ExamApplicationService.getResponseByIndex(examId, questionIndex, studentId),
        ]);

        const normalizedDetail = detail
          ? {
              ...detail,
              questionId,
            }
          : null;

        if (force || questionDetails[questionId] === undefined) {
          setQuestionDetails((prev) => ({
            ...prev,
            [questionId]: normalizedDetail,
          }));
        }
        setResponses((prev) => ({
          ...prev,
          [questionId]: response,
        }));

        return { detail: normalizedDetail, response };
      } catch (err) {
        setQuestionDetails((prev) => ({
          ...prev,
          [questionId]: null,
        }));
        setResponses((prev) => ({
          ...prev,
          [questionId]: null,
        }));
        const messageBody = err instanceof Error ? err.message : "Error desconocido";
        const friendlyMessage = `No se pudo cargar la pregunta ${questionIndex}. ${messageBody}`;
        showError("Error al cargar la pregunta", messageBody);
        setQuestionError(friendlyMessage);
        setError(err as Error);
        return null;
      } finally {
        setLoadingQuestionId(null);
      }
    },
    [examId, questionDetails, responses, studentId]
  );

  const setManualPoints = useCallback(
    async (responseId: string, manualPoints: number) => {
      setSaving(true);
      try {
        const resp = await ExamApplicationService.setManualPoints(responseId, manualPoints);
        if (resp?.data) {
          setResponses((prev) => ({
            ...prev,
            [resp.data.questionId]: resp.data,
          }));
        }
        return resp.data;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const finalizeAssignment = useCallback(async () => {
    if (!assignmentId) return;
    setSaving(true);
    try {
      await ExamApplicationService.finalizeAssignmentGrade(assignmentId);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [assignmentId]);

  const finalizeRegradeRequest = useCallback(async (regradeRequestId: string) => {
    if (!regradeRequestId) return;
    setSaving(true);
    try {
      await ExamApplicationService.finalizeRegradeRequestGrade(regradeRequestId);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    exam,
    responses,
    questionDetails,
    loading,
    loadingQuestionId,
    error,
    saving,
    refresh: fetchExam,
    loadQuestionAssets,
    setManualPoints,
    finalizeAssignment,
    finalizeRegradeRequest,
    questionError,
  };
}
