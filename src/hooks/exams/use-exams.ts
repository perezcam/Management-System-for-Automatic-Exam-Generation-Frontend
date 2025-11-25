"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchExams } from "@/services/exam-bank/exams";
import { fetchSubjects } from "@/services/question-administration/subjects";
import { fetchCurrentUser, fetchUsers } from "@/services/users/users";
import { fetchTeacherDetail, fetchTeachers } from "@/services/users/teachers";
import type { ExamDetail } from "@/types/exam-bank/exam";
import type { SubjectDetail } from "@/types/question-administration/subject";

const DEFAULT_PAGE_SIZE = 10;

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
  return labels[value] ?? value;
};

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

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  useEffect(() => {
    loadTeachingSubjects();
  }, [loadTeachingSubjects]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

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
  };
}
