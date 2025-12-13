"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  PendingExamDetail,
  PendingExamFilterOption,
  PendingExamFilters,
  PendingExamListItem,
  PendingExamQuestion,
} from "@/types/pending-exams/exam";
import {
  ApprovePendingExamPayload,
  RejectPendingExamPayload,
  approvePendingExam,
  fetchPendingExamDetail,
  fetchPendingExams,
  rejectPendingExam,
} from "@/services/pending-exams/exams";
import { fetchSubjectDetail, fetchSubjects } from "@/services/question-administration/subjects";
import { fetchTeacherDetail, fetchTeachers } from "@/services/users/teachers";
import { fetchCurrentUser } from "@/services/users/users";
import { fetchQuestionById } from "@/services/question-bank/questions";
import type { QuestionDetail } from "@/types/question-bank/question";
import type { ExamQuestionListItem } from "@/types/exam-question-list";
import { fetchQuestionTypes } from "@/services/question-administration/question_types";
import type { SubjectDetail } from "@/types/question-administration/subject";

const DEFAULT_PAGE_SIZE = 1;

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
  getExamQuestionsWithDetails: (exam: PendingExamDetail | null) => ExamQuestionListItem[];
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
  const [validatorId, setValidatorId] = useState<string | null>(null);
  const [validatorReady, setValidatorReady] = useState(false);
  const [subjects, setSubjects] = useState<SubjectDetail[]>([]);
  const [leaderSubjectIds, setLeaderSubjectIds] = useState<string[]>([]);
  const [teacherSubjectsMap, setTeacherSubjectsMap] = useState<Record<string, string[]>>({});
  const [currentTeacherId, setCurrentTeacherId] = useState<string | null>(null);
  const examDetailsRef = useRef<ExamDetailCache>({});
  const [questionDetails, setQuestionDetails] = useState<Record<string, QuestionDetail>>({});
  const [subtopicNames, setSubtopicNames] = useState<Record<string, string>>({});
  const [questionTypeNames, setQuestionTypeNames] = useState<Record<string, string>>({});
  const ensurePendingQuestionDetails = useCallback(
    async (questions: PendingExamQuestion[] = []) => {
      const ids = Array.from(
        new Set(
          questions
            .map((question) => question.questionId ?? question.id)
            .filter((id): id is string => Boolean(id)),
        ),
      );
      const missing = ids.filter((id) => !questionDetails[id]);
      if (!missing.length) return;

      const entries = await Promise.all(
        missing.map(async (id) => {
          try {
            const detail = await fetchQuestionById(id);
            return [id, detail] as const;
          } catch (err) {
            console.error(`No se pudo cargar la pregunta ${id}`, err);
            return null;
          }
        }),
      );

      setQuestionDetails((prev) => {
        const next = { ...prev };
        entries.forEach((entry) => {
          if (!entry) return;
          const [id, detail] = entry;
          next[id] = detail;
        });
        return next;
      });
    },
    [questionDetails],
  );

  const resolveValidatorTeacher = useCallback(async () => {
    try {
      const currentUser = await fetchCurrentUser().catch(() => null);
      if (!currentUser?.id) return;

      const teachersPage = await fetchTeachers({ limit: 100, offset: 0 });
      const subjectsMap: Record<string, string[]> = {};
      teachersPage.data.forEach((teacher) => {
        if (teacher.id && teacher.name) {
          teacherNameCache.set(teacher.id, teacher.name);
        }
        const subjectsIds = teacher.teaching_subjects_ids ?? teacher.subjects_ids ?? [];
        subjectsMap[teacher.id] = subjectsIds.filter(Boolean);
      });
      setTeacherSubjectsMap(subjectsMap);

      const currentTeacher = teachersPage.data.find((teacher) => teacher.userId === currentUser.id);
      if (currentTeacher?.id) {
        setCurrentTeacherId(currentTeacher.id);
        setValidatorId(currentTeacher.id);
        if (currentTeacher.name) {
          teacherNameCache.set(currentTeacher.id, currentTeacher.name);
        } else if (currentUser.name) {
          teacherNameCache.set(currentTeacher.id, currentUser.name);
        }
      }
    } catch (err) {
      console.error("No se pudo resolver el validador actual", err);
    } finally {
      setValidatorReady(true);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadLookupData = async () => {
      try {
        const [subjects, questionTypes] = await Promise.all([
          fetchSubjects(),
          fetchQuestionTypes({ limit: 100 }),
        ]);

        if (!active) return;
        setSubjects(subjects);

        const subtopicMap: Record<string, string> = {};
        subjects.forEach((subject) => {
          subject.topics?.forEach((topic) => {
            topic.subtopics?.forEach((subtopic) => {
              if (subtopic.subtopic_id && subtopic.subtopic_name) {
                subtopicMap[subtopic.subtopic_id] = subtopic.subtopic_name;
              }
            });
          });
        });

        const questionTypeMap: Record<string, string> = {};
        questionTypes.forEach((type) => {
          if (type.id && type.name) {
            questionTypeMap[type.id] = type.name;
          }
        });

        setSubtopicNames(subtopicMap);
        setQuestionTypeNames(questionTypeMap);
      } catch (err) {
        console.error("No se pudieron cargar los subtemas y tipos de pregunta", err);
      }
    };

    void loadLookupData();

    return () => {
      active = false;
    };
  }, []);

  const loadExams = useCallback(async () => {
    if (!validatorReady) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (!validatorId) {
        setExams([]);
        setTotal(0);
        return;
      }
      const trimmedSearch = search.trim();
      const { data, meta } = await fetchPendingExams({
        title: trimmedSearch || undefined,
        subjectId: undefined,
        authorId: mapValue(filters.professorId),
        examStatus: mapValue(filters.status),
        validatorId,
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
  }, [filters, page, pageSize, search, validatorId, validatorReady]);

  useEffect(() => {
    void resolveValidatorTeacher();
  }, [resolveValidatorTeacher]);

  useEffect(() => {
    void loadExams();
  }, [loadExams]);

  useEffect(() => {
    if (!currentTeacherId) {
      setLeaderSubjectIds([]);
      return;
    }
    const led = subjects
      .filter((subject) => subject.subject_leader_id === currentTeacherId)
      .map((subject) => subject.subject_id);
    setLeaderSubjectIds(led);
  }, [currentTeacherId, subjects]);

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
    if (!leaderSubjectIds.length) return [];
    const options: PendingExamFilterOption[] = [];
    const seen = new Set<string>();

    Object.entries(teacherSubjectsMap).forEach(([teacherId, subjects]) => {
      const teachesLeaderSubject = subjects.some((subjectId) => leaderSubjectIds.includes(subjectId));
      if (!teachesLeaderSubject) return;
      if (seen.has(teacherId)) return;
      const label = teacherNameCache.get(teacherId) ?? teacherId;
      seen.add(teacherId);
      options.push({ value: teacherId, label });
    });

    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [leaderSubjectIds, teacherSubjectsMap]);

  const subjectOptions = useMemo<PendingExamFilterOption[]>(() => [], []);

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
      await ensurePendingQuestionDetails(detail.questions ?? []);

      examDetailsRef.current[examId] = detail;
      return detail;
    },
    [ensurePendingQuestionDetails],
  );

  const getExamQuestionsWithDetails = useCallback(
    (exam: PendingExamDetail | null): ExamQuestionListItem[] => {
      if (!exam) return [];
      const questions = exam.questions ?? [];
      return questions.map((question) => {
        const questionId = question.questionId ?? question.id;
        const detail = questionDetails[questionId];
        const resolvedSubtopic =
          detail?.subtopicId && subtopicNames[detail.subtopicId]
            ? subtopicNames[detail.subtopicId]
            : question.subtopic;
        const resolvedType =
          detail?.questionTypeId && questionTypeNames[detail.questionTypeId]
            ? questionTypeNames[detail.questionTypeId]
            : question.type;
        return {
          id: question.id,
          subtopic: resolvedSubtopic,
          difficulty: question.difficulty,
          type: resolvedType,
          body: detail?.body ?? question.body,
          response: detail?.response ?? question.response ?? null,
          options: detail?.options ?? question.options ?? null,
        };
      });
    },
    [questionDetails, questionTypeNames, subtopicNames],
  );

  const approveExamHandler = useCallback(
    async (examId: string, payload: ApprovePendingExamPayload = {}) => {
      const detail = await approvePendingExam(examId, payload);
      await ensurePendingQuestionDetails(detail.questions ?? []);
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
    [ensurePendingQuestionDetails],
  );

  const rejectExamHandler = useCallback(
    async (examId: string, payload: RejectPendingExamPayload = {}) => {
      const detail = await rejectPendingExam(examId, payload);
      await ensurePendingQuestionDetails(detail.questions ?? []);
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
    [ensurePendingQuestionDetails],
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
    getExamQuestionsWithDetails,
    approveExam: approveExamHandler,
    rejectExam: rejectExamHandler,
  };
}
