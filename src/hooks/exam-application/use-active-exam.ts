"use client";

import { useCallback, useEffect, useState } from "react";
import { ExamApplicationService } from "@/services/exam-application/exam-application-service";
import {
    ActiveExam,
    ExamResponse,
    ExamResponseCreateInput,
    ExamResponseUpdateInput
} from "@/types/exam-application/exam";

export function useActiveExam(examId: string) {
    const [exam, setExam] = useState<ActiveExam | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchExam = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await ExamApplicationService.getExam(examId);
            setExam(response.data);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [examId]);

    useEffect(() => {
        if (examId) {
            fetchExam();
        }
    }, [fetchExam, examId]);

    const submitAnswer = useCallback(async (response: ExamResponseCreateInput) => {
        setSubmitting(true);
        try {
            const resp = await ExamApplicationService.submitResponse(response);
            return resp.data ?? null;
        } catch (err) {
            return null;
        } finally {
            setSubmitting(false);
        }
    }, []);

    const updateAnswer = useCallback(async (responseId: string, response: ExamResponseUpdateInput) => {
        setSubmitting(true);
        try {
            const resp = await ExamApplicationService.updateResponse(responseId, response);
            return resp.data ?? null;
        } catch (err) {
            return null;
        } finally {
            setSubmitting(false);
        }
    }, []);

    return {
        exam,
        loading,
        error,
        submitting,
        submitAnswer,
        updateAnswer,
        refresh: fetchExam,
    };
}
