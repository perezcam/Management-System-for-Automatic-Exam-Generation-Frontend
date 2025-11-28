"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  PendingExamDetail,
  PendingExamFilterOption,
  PendingExamFilters,
  PendingExamListItem,
} from "@/types/pending-exams/exam";
import {
  ApprovePendingExamPayload,
  RejectPendingExamPayload,
  approvePendingExam,
  fetchPendingExamDetail,
  fetchPendingExams,
  rejectPendingExam,
} from "@/services/pending-exams/exams";
import { fetchSubjectDetail } from "@/services/question-administration/subjects";
import { fetchTeacherDetail } from "@/services/users/teachers";

const DEFAULT_PAGE_SIZE = 10;

export const ALL_PENDING_EXAMS_FILTER = "all";

const DEFAULT_FILTERS: PendingExamFilters = {
  professorId: ALL_PENDING_EXAMS_FILTER,
  subjectId: ALL_PENDING_EXAMS_FILTER,
  status: ALL_PENDING_EXAMS_FILTER,
};

type ExamDetailCache = Record<string, PendingExamDetail>;

const mapValue = (value: string) => (value === ALL_PENDING_EXAMS_FILTER ? undefined : value);


const subjectNameCache = new Map<string, string>();
const teacherNameCache = new Map<string, string>();

const resolveSubjectName = async (subjectId: string): Promise<string | undefined> => {
  if (subjectNameCache.has(subjectId)) {
    return subjectNameCache.get(subjectId);
  }
  try {
    const subject = await fetchSubjectDetail(subjectId); // 👈 cast a any

    subjectNameCache.set(subjectId, subject.subject_name);
    return subject.subject_name;
  } catch {
    return undefined;
  }
};


const resolveTeacherName = async (teacherId: string): Promise<string | undefined> => {
  if (teacherNameCache.has(teacherId)) {
    return teacherNameCache.get(teacherId);
  }
  try {
    const teacher = await fetchTeacherDetail(teacherId);
    // TeacherUser/TeacherDetail normalmente trae `name`
    teacherNameCache.set(teacherId, teacher.name);
    return teacher.name;
  } catch {
    return undefined;
  }
};

const enhanceExamListWithNames = async (
  exams: PendingExamListItem[],
): Promise<PendingExamListItem[]> => {
  // recolectamos ids únicos
  const subjectIds = Array.from(
    new Set(
      exams
        .map((exam) => exam.subjectId)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const creatorIds = Array.from(
    new Set(
      exams
        .map((exam) => exam.creatorId)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  // resolvemos todos en paralelo (y rellenamos los caches)
  await Promise.all([
    Promise.all(subjectIds.map((id) => resolveSubjectName(id))),
    Promise.all(creatorIds.map((id) => resolveTeacherName(id))),
  ]);

  // devolvemos la lista con los nombres reemplazados
  return exams.map((exam) => {
    const subjectName =
      exam.subjectId && subjectNameCache.get(exam.subjectId)
        ? subjectNameCache.get(exam.subjectId)!
        : exam.subject;

    const creatorName =
      exam.creatorId && teacherNameCache.get(exam.creatorId)
        ? teacherNameCache.get(exam.creatorId)!
        : exam.creator;

    return {
      ...exam,
      subject: subjectName,
      creator: creatorName,
    };
  });
};

const enhanceExamDetailWithNames = async (
  exam: PendingExamDetail,
): Promise<PendingExamDetail> => {
  const [subjectName, creatorName] = await Promise.all([
    exam.subjectId ? resolveSubjectName(exam.subjectId) : Promise.resolve(undefined),
    exam.creatorId ? resolveTeacherName(exam.creatorId) : Promise.resolve(undefined),
  ]);

  return {
    ...exam,
    subject: subjectName ?? exam.subject,
    creator: creatorName ?? exam.creator,
  };
};




export type UsePendingExamsResult = {
  exams: PendingExamListItem[];
  loading: boolean;
  error: Error | null;
  page: number;
  pageSize: number;
  total: number | null;
  filters: PendingExamFilters;
  search: string;
  professorOptions: PendingExamFilterOption[];
  subjectOptions: PendingExamFilterOption[];
  setPage: (page: number) => void;
  setFilters: (filters: PendingExamFilters) => void;
  setSearch: (value: string) => void;
  refresh: () => Promise<void>;
  getExamDetail: (examId: string, options?: { force?: boolean }) => Promise<PendingExamDetail>;
  approveExam: (examId: string, payload?: ApprovePendingExamPayload) => Promise<PendingExamDetail>;
  rejectExam: (examId: string, payload?: RejectPendingExamPayload) => Promise<PendingExamDetail>;
};

export function usePendingExams(pageSize: number = DEFAULT_PAGE_SIZE): UsePendingExamsResult {
  const [exams, setExams] = useState<PendingExamListItem[]>([]);
  const [filters, setFiltersState] = useState<PendingExamFilters>(DEFAULT_FILTERS);
  const [search, setSearchState] = useState("");
  const [page, setPageState] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const examDetailsRef = useRef<ExamDetailCache>({});

  const loadExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const trimmedSearch = search.trim();
      const { data, meta } = await fetchPendingExams({
        title: trimmedSearch || undefined,
        subjectId: mapValue(filters.subjectId),
        authorId: mapValue(filters.professorId),
        examStatus: mapValue(filters.status),
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      const totalItems = typeof meta?.total === "number" ? meta.total : data.length;
      const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;
      if (page > totalPages && totalPages > 0) {
        setPageState(totalPages);
        return;
      }

      const enriched = await enhanceExamListWithNames(data);

      setExams(enriched);
      setTotal(totalItems);

    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize, search]);

  useEffect(() => {
    void loadExams();
  }, [loadExams]);

  const refresh = useCallback(async () => {
    await loadExams();
  }, [loadExams]);

  const setFilters = useCallback((nextFilters: PendingExamFilters) => {
    setPageState(1);
    setFiltersState(nextFilters);
  }, []);

  const setSearch = useCallback((value: string) => {
    setPageState(1);
    setSearchState(value);
  }, []);

  const setPage = useCallback((nextPage: number) => {
    setPageState(nextPage < 1 ? 1 : nextPage);
  }, []);

  const professorOptions = useMemo<PendingExamFilterOption[]>(() => {
    const map = new Map<string, string>();
    exams.forEach((exam) => {
      if (!exam.creator) return;
      const value = exam.creatorId ?? exam.creator;
      if (!map.has(value)) {
        map.set(value, exam.creator);
      }
    });
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [exams]);

  const subjectOptions = useMemo<PendingExamFilterOption[]>(() => {
    const map = new Map<string, string>();
    exams.forEach((exam) => {
      if (!exam.subject) return;
      const value = exam.subjectId ?? exam.subject;
      if (!map.has(value)) {
        map.set(value, exam.subject);
      }
    });
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [exams]);

    const getExamDetail = useCallback(
      async (examId: string, options: { force?: boolean } = {}) => {
        if (!options.force) {
          const cached = examDetailsRef.current[examId];
          if (cached) {
            return cached;
          }
        }

        const rawDetail = await fetchPendingExamDetail(examId);
        const detail = await enhanceExamDetailWithNames(rawDetail);

        examDetailsRef.current[examId] = detail;
        return detail;
      },
      [],
    );


  const approveExamHandler = useCallback(
    async (examId: string, payload: ApprovePendingExamPayload = {}) => {
      const detail = await approvePendingExam(examId, payload);
      setExams((prev) =>
        prev.map((exam) =>
          exam.id === examId
            ? {
                ...exam,
                status: detail.status,
                difficulty: detail.difficulty,
                totalQuestions: detail.totalQuestions,
              }
            : exam,
        ),
      );
      examDetailsRef.current[examId] = detail;
      return detail;
    },
    [],
  );

  const rejectExamHandler = useCallback(
    async (examId: string, payload: RejectPendingExamPayload = {}) => {
      const detail = await rejectPendingExam(examId, payload);
      setExams((prev) =>
        prev.map((exam) =>
          exam.id === examId
            ? {
                ...exam,
                status: detail.status,
              }
            : exam,
        ),
      );
      examDetailsRef.current[examId] = detail;
      return detail;
    },
    [],
  );

  return {
    exams,
    loading,
    error,
    page,
    pageSize,
    total,
    filters,
    search,
    professorOptions,
    subjectOptions,
    setPage,
    setFilters,
    setSearch,
    refresh,
    getExamDetail,
    approveExam: approveExamHandler,
    rejectExam: rejectExamHandler,
  };
}
