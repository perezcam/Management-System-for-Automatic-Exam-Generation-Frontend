"use client";

import { useCallback, useEffect, useState } from "react";
import { ExamApplicationService } from "@/services/exam-application/exam-application-service";
import { EvaluatorAssignment, PendingRegradeRequest } from "@/types/exam-application/evaluation";
import { fetchStudentDetail } from "@/services/users/student";
import { fetchExamById } from "@/services/exam-bank/exams";

const DEFAULT_PAGE_SIZE = 50;

export function useRegradeQueues() {
  const [assignments, setAssignments] = useState<EvaluatorAssignment[]>([]);
  const [regradeRequests, setRegradeRequests] = useState<PendingRegradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [search, setSearch] = useState("");
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});
  const [examTitles, setExamTitles] = useState<Record<string, string>>({});

  const fetchQueues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const trimmedSearch = search.trim();
      const [assignmentsResp, regradeResp] = await Promise.all([
        ExamApplicationService.listEvaluatorAssignments({
          page: 1,
          limit: DEFAULT_PAGE_SIZE,
          search: trimmedSearch || undefined,
        }),
        ExamApplicationService.listPendingRegradeRequests({
          page: 1,
          limit: DEFAULT_PAGE_SIZE,
          search: trimmedSearch || undefined,
        }),
      ]);

      setAssignments(assignmentsResp.data ?? []);
      setRegradeRequests(regradeResp.data ?? []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void fetchQueues();
  }, [fetchQueues]);

  const refresh = useCallback(async () => {
    await fetchQueues();
  }, [fetchQueues]);

  useEffect(() => {
    const studentIds = Array.from(
      new Set(
        [
          ...assignments.map((assignment) => assignment.studentId),
        ...regradeRequests.map((request) => request.studentId),
      ].filter((id): id is string => Boolean(id))
    )
  );

  const missingIds = studentIds.filter((id) => !studentNames[id]);
  if (!missingIds.length) return;

  let isCancelled = false;

  const loadStudentNames = async () => {
    const nextNames: Record<string, string> = {};

    await Promise.all(
      missingIds.map(async (studentId) => {
        try {
          const student = await fetchStudentDetail(studentId);
          // Aquí usamos el StudentDetail/StudentUser para sacar el name
          nextNames[studentId] = student.name ?? student.id;
        } catch (err) {
          console.error("No se pudo cargar el nombre del estudiante", err);
        }
      })
    );

    if (isCancelled || !Object.keys(nextNames).length) return;

    setStudentNames((prev) => ({
      ...prev,
      ...nextNames,
    }));
  };

  void loadStudentNames();

  return () => {
    isCancelled = true;
  };
  }, [assignments, regradeRequests, studentNames]);

  useEffect(() => {
    const examIds = Array.from(
      new Set(
        [
          ...assignments.map((assignment) => assignment.examId),
          ...regradeRequests.map((request) => request.examId),
        ].filter((id): id is string => Boolean(id))
      )
    );

    const missingExamIds = examIds.filter((id) => !examTitles[id]);
    if (!missingExamIds.length) return;

    let isCancelled = false;

    const loadExamTitles = async () => {
      const nextTitles: Record<string, string> = {};

      await Promise.all(
        missingExamIds.map(async (examId) => {
          try {
            const exam = await fetchExamById(examId);
            nextTitles[examId] = exam.title ?? exam.id;
          } catch (err) {
            console.error("No se pudo cargar el nombre del examen", err);
          }
        })
      );

      if (isCancelled || !Object.keys(nextTitles).length) return;

      setExamTitles((prev) => ({
        ...prev,
        ...nextTitles,
      }));
    };

    void loadExamTitles();

    return () => {
      isCancelled = true;
    };
  }, [assignments, regradeRequests, examTitles]);



  return {
    assignments,
    regradeRequests,
    loading,
    error,
    studentNames,
    search,
    setSearch,
    refresh,
    examTitles,
  };
}
