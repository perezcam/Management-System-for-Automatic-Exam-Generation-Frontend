"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExamApplicationService } from "@/services/exam-application/exam-application-service";
import { EvaluatorAssignment, PendingRegradeRequest } from "@/types/exam-application/evaluation";
import { fetchStudentDetail } from "@/services/users/student";
import { fetchExamById } from "@/services/exam-bank/exams";

const DEFAULT_PAGE_SIZE = 1;

type QueueFilters = {
  studentId: string;
  subjectId: string;
};

const DEFAULT_FILTERS: QueueFilters = {
  studentId: "ALL",
  subjectId: "ALL",
};

export function useRegradeQueues() {
  const [assignments, setAssignments] = useState<EvaluatorAssignment[]>([]);
  const [regradeRequests, setRegradeRequests] = useState<PendingRegradeRequest[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [regradeLoading, setRegradeLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState<Error | null>(null);
  const [regradeError, setRegradeError] = useState<Error | null>(null);
  const [assignmentSearch, setAssignmentSearchValue] = useState("");
  const [regradeSearch, setRegradeSearchValue] = useState("");
  const [assignmentFilters, setAssignmentFiltersState] = useState<QueueFilters>(DEFAULT_FILTERS);
  const [regradeFilters, setRegradeFiltersState] = useState<QueueFilters>(DEFAULT_FILTERS);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});
  const [examTitles, setExamTitles] = useState<Record<string, string>>({});
  const [assignmentsPage, setAssignmentsPageState] = useState(1);
  const [assignmentsLimit, setAssignmentsLimit] = useState(DEFAULT_PAGE_SIZE);
  const [assignmentsTotal, setAssignmentsTotal] = useState<number | null>(null);
  const [regradePage, setRegradePageState] = useState(1);
  const [regradeLimit, setRegradeLimit] = useState(DEFAULT_PAGE_SIZE);
  const [regradeTotal, setRegradeTotal] = useState<number | null>(null);

  const fetchAssignments = useCallback(async () => {
    setAssignmentsLoading(true);
    setAssignmentsError(null);
    try {
      const response = await ExamApplicationService.listEvaluatorAssignments({
        page: assignmentsPage,
        limit: assignmentsLimit,
        examTitle: assignmentSearch.trim() || undefined,
        subjectId: assignmentFilters.subjectId !== "ALL" ? assignmentFilters.subjectId : undefined,
        studentId: assignmentFilters.studentId !== "ALL" ? assignmentFilters.studentId : undefined,
      });

      setAssignments(response.data ?? []);
      setAssignmentsTotal(response.meta?.total ?? null);

      if (typeof response.meta?.limit === "number" && response.meta.limit > 0) {
        setAssignmentsLimit(response.meta.limit);
      }
    } catch (err) {
      setAssignmentsError(err as Error);
    } finally {
      setAssignmentsLoading(false);
    }
  }, [assignmentFilters, assignmentSearch, assignmentsLimit, assignmentsPage]);

  const fetchRegradeRequests = useCallback(async () => {
    setRegradeLoading(true);
    setRegradeError(null);
    try {
      const response = await ExamApplicationService.listPendingRegradeRequests({
        page: regradePage,
        limit: regradeLimit,
        examTitle: regradeSearch.trim() || undefined,
        subjectId: regradeFilters.subjectId !== "ALL" ? regradeFilters.subjectId : undefined,
        studentId: regradeFilters.studentId !== "ALL" ? regradeFilters.studentId : undefined,
      });

      setRegradeRequests(response.data ?? []);
      setRegradeTotal(response.meta?.total ?? null);

      if (typeof response.meta?.limit === "number" && response.meta.limit > 0) {
        setRegradeLimit(response.meta.limit);
      }
    } catch (err) {
      setRegradeError(err as Error);
    } finally {
      setRegradeLoading(false);
    }
  }, [regradeFilters, regradeLimit, regradePage, regradeSearch]);

  useEffect(() => {
    void fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    void fetchRegradeRequests();
  }, [fetchRegradeRequests]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchAssignments(), fetchRegradeRequests()]);
  }, [fetchAssignments, fetchRegradeRequests]);

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
    loading: assignmentsLoading || regradeLoading,
    assignmentsLoading,
    regradeLoading,
    error: assignmentsError ?? regradeError,
    assignmentsError,
    regradeError,
    studentNames,
    examTitles,
    search: useMemo(() => assignmentSearch || regradeSearch, [assignmentSearch, regradeSearch]),
    assignmentSearch,
    regradeSearch,
    setAssignmentSearch: useCallback((value: string) => {
      setAssignmentsPageState(1);
      setAssignmentSearchValue(value);
    }, []),
    setRegradeSearch: useCallback((value: string) => {
      setRegradePageState(1);
      setRegradeSearchValue(value);
    }, []),
    refresh,
    assignmentsPage,
    assignmentsLimit,
    assignmentsTotal,
    regradePage,
    regradeLimit,
    regradeTotal,
    setAssignmentsPage,
    setRegradePage,
    assignmentFilters,
    regradeFilters,
    setAssignmentFilters: useCallback((next: QueueFilters) => {
      setAssignmentsPageState(1);
      setAssignmentFiltersState(next);
    }, []),
    setRegradeFilters: useCallback((next: QueueFilters) => {
      setRegradePageState(1);
      setRegradeFiltersState(next);
    }, []),
  };
}
