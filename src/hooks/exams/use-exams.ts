"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createAutomaticExam,
  createManualExam,
  deleteExam as deleteExamRequest,
  fetchExamById,
  fetchExams,
  sendExamForReview as sendExamForReviewRequest,
  updateExam,
} from "@/services/exam-bank/exams";
import { fetchQuestionById } from "@/services/question-bank/questions";
import { fetchSubjects } from "@/services/question-administration/subjects";
import { fetchCurrentUser, fetchUsers } from "@/services/users/users";
import { fetchTeacherDetail, fetchTeachers } from "@/services/users/teachers";
import type {
  CreateAutomaticExamPayload,
  CreateManualExamPayload,
  ExamDetail,
  ExamQuestionAssignment,
  AutomaticExamPreview,
  AutomaticExamPreviewQuestion,
} from "@/types/exam-bank/exam";
import type { QuestionDetail } from "@/types/question-bank/question";
import type { SubjectDetail } from "@/types/question-administration/subject";
import { distributeScoreEvenly } from "@/utils/exam-scores";

const DEFAULT_PAGE_SIZE = 6;

export const STATUS_LABELS: Record<string, string> = {
  valid: "Aprobado",
  on_review: "Bajo Revisión",
  invalid: "Rechazado",
  draft: "Borrador",
  published: "Publicado"
};



export const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Fácil",
  MEDIUM: "Regular",
  HARD: "Difícil",
  MIXED: "Mixta",
};

export type ExamFilters = {
  subjectId: string;
  difficulty: string;
  status: string;
  authorId: string;
};

export type ExamListItem = {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
  subjectId: string;
  subjectName: string;
  questionCount: number;
  difficulty: string;
  difficultyLabel: string;
  authorId: string;
  authorLabel: string;
  validatorId?: string | null;
  validatorLabel?: string | null;
  createdAt: string;
  createdAtLabel: string;
};

export type ExamQuestionItem = ExamQuestionAssignment & {
  key: string;
  detail?: QuestionDetail;
};

export const DEFAULT_EXAM_FILTERS: ExamFilters = {
  subjectId: "all",
  difficulty: "all",
  status: "all",
  authorId: "all",
};

const formatDateLabel = (value?: string | null): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-ES");
};

const withFallbackLabel = (value?: string | null, labels: Record<string, string> = {}) => {
  if (!value) return "—";
  const normalized = String(value);
  return labels[normalized] ?? labels[normalized.toUpperCase()] ?? normalized;
};

const ensureQuestionScores = (questions: ExamQuestionAssignment[]): ExamQuestionAssignment[] => {
  if (!questions.length) return questions;
  const missingScore = questions.some((question) => typeof question.questionScore !== "number");
  if (!missingScore) return questions;
  const defaultScores = distributeScoreEvenly(questions.length);
  return questions.map((question, index) => ({
    ...question,
    questionScore:
      typeof question.questionScore === "number" ? question.questionScore : defaultScores[index] ?? 0,
  }));
};

const normalizeExamQuestions = (questions: ExamQuestionAssignment[] | AutomaticExamPreviewQuestion[] = []): ExamQuestionAssignment[] => {
  const sorted = [...questions].sort((a, b) => (a.questionIndex ?? 0) - (b.questionIndex ?? 0));
  const normalized = sorted.map((question, index) => ({
    ...question,
    questionIndex: index + 1,
    id: (question as any).id ?? `${question.questionId}-${index}`,
    examId: (question as any).examId ?? "",
  })) as ExamQuestionAssignment[];
  return ensureQuestionScores(normalized);
};

const toPatchPayloadQuestions = (questions: ExamQuestionAssignment[]) =>
  normalizeExamQuestions(questions)
    .map((question, idx) => {
      const questionId = (question as unknown as { question_id?: string }).question_id ?? question.questionId;
      if (!questionId) return null;
      return {
        questionId,
        questionIndex: question.questionIndex ?? idx + 1,
        questionScore: question.questionScore ?? 0,
      };
    })
    .filter(Boolean) as Array<{ questionId: string; questionIndex: number; questionScore: number }>;

export type UseExamsResult = {
  exams: ExamListItem[];
  rawExams: ExamDetail[];
  filters: ExamFilters;
  setFilters: (next: ExamFilters) => void;
  search: string;
  setSearch: (value: string) => void;
  loading: boolean;
  error: Error | null;
  page: number;
  pageSize: number;
  total: number | null;
  availableSubjects: SubjectDetail[];
  availableAuthors: Array<{ id: string; name: string }>;
  availableStatuses: string[];
  availableDifficulties: string[];
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  creatingExam: boolean;
  createManual: (payload: CreateManualExamPayload) => Promise<ExamDetail | null>;
  createAutomatic: (payload: CreateAutomaticExamPayload) => Promise<AutomaticExamPreview | null>;
  selectedExamId: string | null;
  selectedExam: ExamDetail | null;
  selectedExamQuestions: ExamQuestionItem[];
  selectedExamLoading: boolean;
  selectedExamError: Error | null;
  savingExam: boolean;
  deletingExam: boolean;
  sendingForReview: boolean;
  saveExamQuestions: (questions: ExamQuestionAssignment[]) => Promise<void>;
  selectExam: (examId: string | null) => Promise<void>;
  refreshSelectedExam: () => Promise<void>;
  addQuestionToSelectedExam: (questionId: string) => Promise<void>;
  removeQuestionFromSelectedExam: (questionId: string) => Promise<void>;
  reorderSelectedExamQuestions: (fromIndex: number, toIndex: number) => Promise<void>;
  deleteExam: (examId: string) => Promise<void>;
  sendExamForReview: (examId: string) => Promise<void>;
  clearSelection: () => void;
  getQuestionsWithDetails: (assignments: ExamQuestionAssignment[] | AutomaticExamPreviewQuestion[]) => ExamQuestionItem[];
};

export function useExams(pageSize: number = DEFAULT_PAGE_SIZE): UseExamsResult {
  const [filters, setFiltersState] = useState<ExamFilters>(DEFAULT_EXAM_FILTERS);
  const [search, setSearchState] = useState("");
  const [page, setPageState] = useState(1);

  const [rawExams, setRawExams] = useState<ExamDetail[]>([]);
  const [subjects, setSubjects] = useState<SubjectDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [teachingSubjectIds, setTeachingSubjectIds] = useState<string[]>([]);
  const [teacherNameById, setTeacherNameById] = useState<Record<string, string>>({});
  const [teacherSubjectsMap, setTeacherSubjectsMap] = useState<Record<string, string[]>>({});
  const [currentTeacherId, setCurrentTeacherId] = useState<string | null>(null);
  const [currentTeacherName, setCurrentTeacherName] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<ExamDetail | null>(null);
  const [selectedExamLoading, setSelectedExamLoading] = useState(false);
  const [selectedExamError, setSelectedExamError] = useState<Error | null>(null);
  const [savingExam, setSavingExam] = useState(false);
  const [deletingExam, setDeletingExam] = useState(false);
  const [sendingForReview, setSendingForReview] = useState(false);
  const [questionDetails, setQuestionDetails] = useState<Record<string, QuestionDetail>>({});
  const [creatingExam, setCreatingExam] = useState(false);

  const subjectIdToName = useMemo(() => {
    const map = new Map<string, string>();
    subjects.forEach((subject) => map.set(subject.subject_id, subject.subject_name));
    return map;
  }, [subjects]);

  const loadTeachingSubjects = useCallback(async () => {
    try {
      const currentUser = await fetchCurrentUser().catch(() => null);
      if (!currentUser?.id) return;

      const teachersPage = await fetchTeachers({ limit: 100, offset: 0 });

      const namesMap: Record<string, string> = {};
      const subjectsMap: Record<string, string[]> = {};
      teachersPage.data.forEach((teacher) => {
        const subjectsIds = teacher.teaching_subjects_ids ?? teacher.subjects_ids ?? [];
        subjectsMap[teacher.id] = subjectsIds.filter(Boolean);
      });
      setTeacherSubjectsMap(subjectsMap);

      // Intentar resolver nombres desde el modelo de usuarios (fuente de verdad)
      try {
        const usersPage = await fetchUsers({ role: "teacher", limit: 100, offset: 0 });
        const userNameByUserId = new Map<string, string>();
        usersPage.data.forEach((user) => {
          if (user.id) {
            userNameByUserId.set(user.id, user.name);
          }
        });

        teachersPage.data.forEach((teacher) => {
          const userName = userNameByUserId.get(teacher.userId);
          if (userName) {
            namesMap[teacher.id] = userName;
          }
        });
      } catch (err) {
        console.error("No se pudieron resolver los nombres desde Users", err);
      }

      // Si no se pudo con Users, caemos al nombre del modelo teacher como respaldo
      teachersPage.data.forEach((teacher) => {
        if (!namesMap[teacher.id] && teacher.name) {
          namesMap[teacher.id] = teacher.name;
        }
      });

      setTeacherNameById(namesMap);
      setTeacherSubjectsMap(subjectsMap);

      const teacher = teachersPage.data.find((t) => t.userId === currentUser.id);
      if (!teacher) return;

      setCurrentTeacherId(teacher.id);
      setCurrentTeacherName(namesMap[teacher.id] ?? teacher.name);

      try {
        const teacherDetail = await fetchTeacherDetail(teacher.id);
        const subjectsIds =
          teacherDetail.teaching_subjects_ids ??
          teacherDetail.subjects_ids ??
          [];
        setTeachingSubjectIds(subjectsIds.filter(Boolean));
        if (teacherDetail.name) {
          setCurrentTeacherName(teacherDetail.name);
          setTeacherNameById((prev) => ({ ...prev, [teacher.id]: teacherDetail.name }));
        }
      } catch (err) {
        console.error("No se pudo obtener el detalle del profesor actual", err);
      }
    } catch (err) {
      console.error("No se pudo resolver el profesor actual", err);
    }
  }, []);

  const availableStatuses = useMemo(() => {
    const statuses = new Set<string>();
    rawExams.forEach((exam) => {
      if (exam.examStatus) {
        statuses.add(exam.examStatus);
      }
    });
    return Array.from(statuses);
  }, [rawExams]);

  const availableDifficulties = useMemo(() => {
    const values = new Set<string>();
    rawExams.forEach((exam) => {
      if (exam.difficulty) {
        values.add(exam.difficulty);
      }
    });
    return Array.from(values);
  }, [rawExams]);

  const allowedAuthorIds = useMemo(() => {
    if (!teachingSubjectIds.length) return null;
    const currentSubjects = new Set(teachingSubjectIds);
    const allowed = new Set<string>();

    Object.entries(teacherSubjectsMap).forEach(([teacherId, subjects]) => {
      if (subjects.some((subjectId) => currentSubjects.has(subjectId))) {
        allowed.add(teacherId);
      }
    });

    return allowed;
  }, [teachingSubjectIds, teacherSubjectsMap]);

  const availableAuthors = useMemo(() => {
    const seen = new Set<string>();
    const values: Array<{ id: string; name: string }> = [];

    rawExams.forEach((exam) => {
      if (!exam.authorId) return;
      if (allowedAuthorIds && !allowedAuthorIds.has(exam.authorId)) return;
      if (seen.has(exam.authorId)) return;
      const name = teacherNameById[exam.authorId];
      if (!name) return;
      seen.add(exam.authorId);
      values.push({
        id: exam.authorId,
        name,
      });
    });

    if (
      currentTeacherId &&
      (!allowedAuthorIds || allowedAuthorIds.has(currentTeacherId)) &&
      !seen.has(currentTeacherId)
    ) {
      const name = teacherNameById[currentTeacherId] ?? currentTeacherName;
      if (name) {
        values.push({
          id: currentTeacherId,
          name,
        });
      }
    }

    return values;
  }, [allowedAuthorIds, currentTeacherId, currentTeacherName, rawExams, teacherNameById]);

  const exams = useMemo<ExamListItem[]>(() => {
    return rawExams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      status: exam.examStatus,
      statusLabel: withFallbackLabel(exam.examStatus, STATUS_LABELS),
      subjectId: exam.subjectId,
      subjectName: subjectIdToName.get(exam.subjectId) ?? "",
      questionCount: exam.questionCount,
      difficulty: exam.difficulty,
      difficultyLabel: withFallbackLabel(exam.difficulty, DIFFICULTY_LABELS),
      authorId: exam.authorId,
      authorLabel: exam.authorId ? teacherNameById[exam.authorId] ?? "" : "",
      validatorId: exam.validatorId,
      validatorLabel: exam.validatorId ? teacherNameById[exam.validatorId] ?? null : null,
      createdAt: exam.createdAt,
      createdAtLabel: formatDateLabel(exam.createdAt),
    }));
  }, [rawExams, subjectIdToName, teacherNameById]);

  const selectedExamQuestions = useMemo<ExamQuestionItem[]>(() => {
    if (!selectedExam?.questions) return [];
    const normalized = normalizeExamQuestions(selectedExam.questions);
    return normalized.map((question) => ({
      ...question,
      key: question.id ?? question.questionId,
      detail: questionDetails[question.questionId],
    }));
  }, [questionDetails, selectedExam]);

  const loadSubjects = useCallback(async () => {
    try {
      const fetchedSubjects = await fetchSubjects();
      if (teachingSubjectIds.length) {
        const allowed = new Set(teachingSubjectIds);
        setSubjects(fetchedSubjects.filter((subject) => allowed.has(subject.subject_id)));
      } else {
        setSubjects(fetchedSubjects);
      }
    } catch (err) {
      console.error("No se pudieron cargar las asignaturas", err);
    }
  }, [teachingSubjectIds]);

  const loadExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, meta } = await fetchExams({
        subjectId: filters.subjectId !== "all" ? filters.subjectId : undefined,
        difficulty: filters.difficulty !== "all" ? filters.difficulty : undefined,
        examStatus: filters.status !== "all" ? filters.status : undefined,
        authorId: filters.authorId !== "all" ? filters.authorId : undefined,
        title: search || undefined,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      setRawExams(data);
      setTotal(meta?.total ?? data.length);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters.authorId, filters.difficulty, filters.status, filters.subjectId, page, pageSize, search]);

  const ensureQuestionDetails = useCallback(
    async (questions: ExamQuestionAssignment[] | AutomaticExamPreviewQuestion[] = []) => {
      const ids = questions.map((item) => item.questionId).filter(Boolean);
      const missing = Array.from(new Set(ids)).filter((id) => !questionDetails[id]);
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

  const loadSelectedExam = useCallback(
    async (examId: string) => {
      setSelectedExamLoading(true);
      setSelectedExamError(null);
      setSelectedExamId(examId);
      setSelectedExam(null);
      try {
        const exam = await fetchExamById(examId);
        setSelectedExam(exam);
        await ensureQuestionDetails(exam.questions ?? []);
      } catch (err) {
        setSelectedExamError(err as Error);
      } finally {
        setSelectedExamLoading(false);
      }
    },
    [ensureQuestionDetails],
  );

  const refreshSelectedExam = useCallback(async () => {
    if (!selectedExamId) return;
    await loadSelectedExam(selectedExamId);
  }, [loadSelectedExam, selectedExamId]);

  const clearSelection = useCallback(() => {
    setSelectedExamId(null);
    setSelectedExam(null);
    setSelectedExamError(null);
  }, []);

  const persistExamQuestions = useCallback(
    async (questions: ExamQuestionAssignment[]) => {
      if (!selectedExamId) return;
      setSelectedExamError(null);
      setSavingExam(true);
      try {
        const payload = {
          questions: toPatchPayloadQuestions(questions),
        };
        if (!payload.questions.length) {
          throw new Error("No se pudo preparar el listado de preguntas para guardar");
        }
        const updated = await updateExam(selectedExamId, payload);
        setSelectedExam(updated);
        setRawExams((prev) =>
          prev.map((exam) => (exam.id === updated.id ? { ...exam, ...updated } : exam)),
        );
        await ensureQuestionDetails(updated.questions ?? []);
      } catch (err) {
        setSelectedExamError(err as Error);
        throw err;
      } finally {
        setSavingExam(false);
      }
    },
    [ensureQuestionDetails, selectedExamId],
  );

  const reorderSelectedExamQuestions = useCallback(
    async (fromIndex: number, toIndex: number) => {
      if (!selectedExam) return;
      const current = normalizeExamQuestions(selectedExam.questions ?? []);
      if (fromIndex === toIndex) return;
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= current.length || toIndex >= current.length) return;

      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);

      setSelectedExam((prev) =>
        prev
          ? {
            ...prev,
            questions: normalizeExamQuestions(next),
            questionCount: next.length,
          }
          : prev,
      );

      await persistExamQuestions(next);
    },
    [persistExamQuestions, selectedExam],
  );

  const removeQuestionFromSelectedExam = useCallback(
    async (questionId: string) => {
      if (!selectedExam) return;
      const current = normalizeExamQuestions(selectedExam.questions ?? []);
      const next = current.filter((question) => question.questionId !== questionId);
      setSelectedExam((prev) =>
        prev
          ? {
            ...prev,
            questions: normalizeExamQuestions(next),
            questionCount: next.length,
          }
          : prev,
      );
      await persistExamQuestions(next);
    },
    [persistExamQuestions, selectedExam],
  );

  const addQuestionToSelectedExam = useCallback(
    async (questionId: string) => {
      if (!selectedExam) return;
      const current = normalizeExamQuestions(selectedExam.questions ?? []);
      if (current.some((question) => question.questionId === questionId)) return;

      const next: ExamQuestionAssignment[] = [
        ...current,
        {
          id: `temp-${questionId}-${Date.now()}`,
          examId: selectedExam.id,
          questionId,
          questionIndex: current.length + 1,
        },
      ];

      setSelectedExam((prev) =>
        prev
          ? {
            ...prev,
            questions: normalizeExamQuestions(next),
            questionCount: next.length,
          }
          : prev,
      );

      await ensureQuestionDetails([
        {
          id: questionId,
          examId: selectedExam.id,
          questionId,
          questionIndex: next.length,
        },
      ]);
      await persistExamQuestions(next);
    },
    [ensureQuestionDetails, persistExamQuestions, selectedExam],
  );

  const selectExam = useCallback(
    async (examId: string | null) => {
      if (!examId) {
        clearSelection();
        return;
      }
      await loadSelectedExam(examId);
    },
    [clearSelection, loadSelectedExam],
  );

  const deleteExam = useCallback(
    async (examId: string) => {
      setDeletingExam(true);
      setSelectedExamError(null);
      try {
        await deleteExamRequest(examId);
        setRawExams((prev) => prev.filter((exam) => exam.id !== examId));
        setTotal((prev) => (typeof prev === "number" ? Math.max(0, prev - 1) : prev));

        if (selectedExamId === examId) {
          clearSelection();
        }
      } catch (err) {
        setSelectedExamError(err as Error);
        throw err;
      } finally {
        setDeletingExam(false);
      }
    },
    [clearSelection, selectedExamId],
  );

  const createManual = useCallback(
    async (payload: CreateManualExamPayload) => {
      setCreatingExam(true);
      setSelectedExamError(null);
      try {
        const created = await createManualExam(payload);
        setRawExams((prev) => [created, ...prev]);
        setTotal((prev) => (typeof prev === "number" ? prev + 1 : prev));
        setSelectedExam(created);
        setSelectedExamId(created.id);
        await ensureQuestionDetails(created.questions ?? []);
        return created;
      } catch (err) {
        setSelectedExamError(err as Error);
        throw err;
      } finally {
        setCreatingExam(false);
      }
    },
    [ensureQuestionDetails],
  );

  const saveExamQuestions = useCallback(
    async (questions: ExamQuestionAssignment[]) => {
      await persistExamQuestions(questions);
    },
    [persistExamQuestions],
  );

  const createAutomatic = useCallback(
    async (payload: CreateAutomaticExamPayload) => {
      setCreatingExam(true);
      setSelectedExamError(null);
      try {
        const created = await createAutomaticExam(payload);
        // No actualizamos rawExams ni selectedExam porque es solo una previsualización
        await ensureQuestionDetails(created.questions ?? []);
        return created;
      } catch (err) {
        setSelectedExamError(err as Error);
        throw err;
      } finally {
        setCreatingExam(false);
      }
    },
    [ensureQuestionDetails],
  );

  const sendExamForReview = useCallback(
    async (examId: string) => {
      setSendingForReview(true);
      setSelectedExamError(null);
      try {
        const updated = await sendExamForReviewRequest(examId);
        setSelectedExam(updated);
        setRawExams((prev) =>
          prev.map((exam) => (exam.id === updated.id ? { ...exam, ...updated } : exam))
        );
      } catch (err) {
        setSelectedExamError(err as Error);
        throw err;
      } finally {
        setSendingForReview(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  useEffect(() => {
    loadTeachingSubjects();
  }, [loadTeachingSubjects]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  useEffect(() => {
    if (selectedExam?.questions?.length) {
      void ensureQuestionDetails(selectedExam.questions);
    }
  }, [ensureQuestionDetails, selectedExam]);

  const setFilters = (next: ExamFilters) => {
    setPageState(1);
    setFiltersState(next);
  };

  const setSearch = (value: string) => {
    setPageState(1);
    setSearchState(value);
  };

  const setPage = (nextPage: number) => {
    setPageState(nextPage);
  };

  const refresh = async () => {
    await loadExams();
  };

  const getQuestionsWithDetails = useCallback(
    (assignments: ExamQuestionAssignment[] | AutomaticExamPreviewQuestion[]): ExamQuestionItem[] => {
      return normalizeExamQuestions(assignments as ExamQuestionAssignment[]).map((question) => {
        const previewQuestion = assignments.find(a => a.questionId === question.questionId) as AutomaticExamPreviewQuestion | undefined;

        // If we have preview details, use them as fallback for detail
        const detail = questionDetails[question.questionId] ?? (previewQuestion ? {
          id: previewQuestion.questionId,
          body: previewQuestion.body,
          difficulty: previewQuestion.difficulty as any, // Cast if needed
          questionTypeId: previewQuestion.questionTypeId,
          subtopicId: previewQuestion.subTopicId,
          options: previewQuestion.options?.map(o => ({
            id: "", // No ID in preview
            text: o.text,
            isCorrect: o.isCorrect,
            questionId: previewQuestion.questionId
          })) ?? [],
          response: previewQuestion.response ?? "",
          authorId: "", // Not in preview
          createdAt: "",
          updatedAt: "",
          status: "APPROVED" // Assumed
        } : undefined);

        return {
          ...question,
          key: question.id ?? question.questionId,
          detail,
        };
      });
    },
    [questionDetails],
  );

  return {
    exams,
    rawExams,
    filters,
    setFilters,
    search,
    setSearch,
    loading,
    error,
    page,
    pageSize,
    total,
    availableSubjects: subjects,
    availableAuthors,
    availableStatuses,
    availableDifficulties,
    refresh,
    setPage,
    creatingExam,
    createManual,
    createAutomatic,
    selectedExamId,
    selectedExam,
    selectedExamQuestions,
    selectedExamLoading,
    selectedExamError,
    savingExam,
    deletingExam,
    sendingForReview,
    selectExam,
    refreshSelectedExam,
    addQuestionToSelectedExam,
    removeQuestionFromSelectedExam,
    reorderSelectedExamQuestions,
    deleteExam,
    sendExamForReview,
    saveExamQuestions,
    clearSelection,
    getQuestionsWithDetails,
  };
}
