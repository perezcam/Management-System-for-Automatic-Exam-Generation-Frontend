"use client";

import { useCallback, useEffect, useState } from "react";
import { ExamApplicationService } from "@/services/exam-application/exam-application-service";
import { EvaluatorAssignment, PendingRegradeRequest } from "@/types/exam-application/evaluation";
import { fetchStudentDetail } from "@/services/users/student";
import { fetchExamById } from "@/services/exam-bank/exams";

const DEFAULT_PAGE_SIZE = 1;

export function useRegradeQueues() {
  const [assignments, setAssignments] = useState<EvaluatorAssignment[]>([]);
  const [regradeRequests, setRegradeRequests] = useState<PendingRegradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [search, setSearchValue] = useState("");
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});
  const [examTitles, setExamTitles] = useState<Record<string, string>>({});
  const [assignmentsPage, setAssignmentsPageState] = useState(1);
  const [assignmentsLimit, setAssignmentsLimit] = useState(DEFAULT_PAGE_SIZE);
  const [assignmentsTotal, setAssignmentsTotal] = useState<number | null>(null);
  const [regradePage, setRegradePageState] = useState(1);
  const [regradeLimit, setRegradeLimit] = useState(DEFAULT_PAGE_SIZE);
  const [regradeTotal, setRegradeTotal] = useState<number | null>(null);

  const fetchQueues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const trimmedSearch = search.trim();
      const [assignmentsResp, regradeResp] = await Promise.all([
        ExamApplicationService.listEvaluatorAssignments({
          page: assignmentsPage,
          limit: assignmentsLimit,
          search: trimmedSearch || undefined,
        }),
        ExamApplicationService.listPendingRegradeRequests({
          page: regradePage,
          limit: regradeLimit,
          search: trimmedSearch || undefined,
        }),
      ]);

      setAssignments(assignmentsResp.data ?? []);
      setRegradeRequests(regradeResp.data ?? []);
      setAssignmentsTotal(assignmentsResp.meta?.total ?? null);
      setRegradeTotal(regradeResp.meta?.total ?? null);

      if (typeof assignmentsResp.meta?.limit === "number" && assignmentsResp.meta.limit > 0) {
        setAssignmentsLimit(assignmentsResp.meta.limit);
      }
      if (typeof regradeResp.meta?.limit === "number" && regradeResp.meta.limit > 0) {
        setRegradeLimit(regradeResp.meta.limit);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [assignmentsLimit, assignmentsPage, regradeLimit, regradePage, search]);

  useEffect(() => {
    void fetchQueues();
  }, [fetchQueues]);

  const refresh = useCallback(async () => {
    await fetchQueues();
  }, [fetchQueues]);

  const setAssignmentsPage = useCallback(
    (nextPage: number) => {
      setAssignmentsPageState(nextPage < 1 ? 1 : nextPage);
    },
    [setAssignmentsPageState]
  );

  const setRegradePage = useCallback(
    (nextPage: number) => {
      setRegradePageState(nextPage < 1 ? 1 : nextPage);
    },
    [setRegradePageState]
  );

  const setSearch = useCallback(
    (value: string) => {
      setAssignmentsPageState(1);
      setRegradePageState(1);
      setSearchValue(value);
    },
    [setAssignmentsPageState, setRegradePageState, setSearchValue]
  );

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
    examTitles,
    search,
    setSearch,
    refresh,
    assignmentsPage,
    assignmentsLimit,
    assignmentsTotal,
    regradePage,
    regradeLimit,
    regradeTotal,
    setAssignmentsPage,
    setRegradePage,
  };
}
