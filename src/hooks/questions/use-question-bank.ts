"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { createQuestion, deleteQuestion, fetchQuestions, updateQuestion } from "@/services/question-bank/questions";
import { fetchQuestionTypes } from "@/services/question-administration/question_types";
import { fetchTopics } from "@/services/question-administration/topics";
import { fetchTeachers, fetchTeacherDetail } from "@/services/users/teachers";
import type { QuestionFilterValues, QuestionListItem } from "@/types/question-bank/view";
import type { QuestionDetail, CreateQuestionPayload, UpdateQuestionPayload } from "@/types/question-bank/question";
import { DifficultyLevelEnum } from "@/types/question-bank/enums/difficultyLevel";
import type { QuestionTypeDetail } from "@/types/question-administration/question-type";
import type { TopicDetail } from "@/types/question-administration/topic";
import { fetchCurrentUser } from "@/services/users/users";

const DEFAULT_PAGE_SIZE = 2;

const DIFFICULTY_LABELS: Record<DifficultyLevelEnum, QuestionListItem["difficulty"]> = {
  [DifficultyLevelEnum.EASY]: "Fácil",
  [DifficultyLevelEnum.MEDIUM]: "Regular",
  [DifficultyLevelEnum.HARD]: "Difícil",
};

const DIFFICULTY_ENUM_BY_LABEL: Record<QuestionListItem["difficulty"], DifficultyLevelEnum> = {
  "Fácil": DifficultyLevelEnum.EASY,
  "Regular": DifficultyLevelEnum.MEDIUM,
  "Difícil": DifficultyLevelEnum.HARD,
};

const DEFAULT_FILTERS: QuestionFilterValues = {
  subtopic: "all",
  type: "all",
  difficulty: "all",
};

// Tipo local que extiende TopicDetail con subjects opcional
type TopicWithSubjects = TopicDetail & {
  subjects?: Array<{ subject_id?: string; id?: string }>;
};

export type UseQuestionBankResult = {
  questions: QuestionListItem[];
  rawQuestions: QuestionDetail[];
  loading: boolean;
  error: Error | null;
  total: number | null;
  page: number;
  pageSize: number;
  filters: QuestionFilterValues;
  search: string;
  questionTypes: QuestionTypeDetail[];
  topics: TopicDetail[];
  allSubtopics: Array<{ id: string; name: string }>;
  availableSubtopics: Array<{ id: string; name: string }>;
  uniqueSubtopicNames: string[];
  uniqueQuestionTypeNames: string[];
  setFilters: (next: QuestionFilterValues) => void;
  setSearch: (value: string) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  create: (payload: CreateQuestionPayload) => Promise<QuestionDetail>;
  update: (questionId: string, payload: UpdateQuestionPayload) => Promise<QuestionDetail>;
  remove: (questionId: string) => Promise<void>;
};

export function useQuestionBank(pageSize: number = DEFAULT_PAGE_SIZE): UseQuestionBankResult {
  const [filters, setFiltersState] = useState<QuestionFilterValues>(DEFAULT_FILTERS);
  const [search, setSearch] = useState("");
  const [page, setPageState] = useState(1);

  const [questions, setQuestions] = useState<QuestionDetail[]>([]);
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeDetail[]>([]);
  const [topics, setTopics] = useState<TopicDetail[]>([]);
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentTeacherId, setCurrentTeacherId] = useState<string | null>(null);
  const [teachingSubjectIds, setTeachingSubjectIds] = useState<string[]>([]);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentTeacherName, setCurrentTeacherName] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  const questionTypeNameToId = useMemo(() => {
    const map = new Map<string, string>();
    questionTypes.forEach((type) => map.set(type.name, type.id));
    return map;
  }, [questionTypes]);

  const questionTypeIdToName = useMemo(() => {
    const map = new Map<string, string>();
    questionTypes.forEach((type) => map.set(type.id, type.name));
    return map;
  }, [questionTypes]);

  // Todos los subtemas de todos los topics
  const allSubtopics = useMemo(
    () =>
      topics.flatMap((topic) =>
        topic.subtopics.map((subtopic) => ({
          id: subtopic.subtopic_id,
          name: subtopic.subtopic_name,
        })),
      ),
    [topics],
  );

  // Nombres de subtemas que aparecen en topics de asignaturas donde el profe IMPARTE
  const teacherSubtopicNames = useMemo(() => {
    if (!teachingSubjectIds.length) return [] as string[];

    const teacherSubjects = new Set(teachingSubjectIds);
    const names = new Set<string>();

    (topics as TopicWithSubjects[]).forEach((topic) => {
      const topicSubjects = topic.subjects ?? [];
      const belongsToTeacher = topicSubjects.some((subject) =>
        teacherSubjects.has(subject.subject_id ?? subject.id ?? ""),
      );

      if (!belongsToTeacher) return;

      topic.subtopics.forEach((subtopic) => {
        names.add(subtopic.subtopic_name);
      });
    });

    return Array.from(names);
  }, [topics, teachingSubjectIds]);

  // Opciones únicas de subtemas para filtros (si no hay info de profesor, usamos todos)
  const uniqueSubtopicNames = useMemo(() => {
    if (teacherSubtopicNames.length) {
      return teacherSubtopicNames;
    }
    return Array.from(new Set(allSubtopics.map((subtopic) => subtopic.name)));
  }, [allSubtopics, teacherSubtopicNames]);

  // Subtemas disponibles en el formulario (id + nombre) basados en los nombres anteriores
  const availableSubtopics = useMemo(() => {
    if (!uniqueSubtopicNames.length) return allSubtopics;

    const allowedNames = new Set(uniqueSubtopicNames);
    const seen = new Set<string>();
    const list: Array<{ id: string; name: string }> = [];

    allSubtopics.forEach((subtopic) => {
      if (!allowedNames.has(subtopic.name)) return;
      if (seen.has(subtopic.id)) return;
      seen.add(subtopic.id);
      list.push(subtopic);
    });

    return list;
  }, [allSubtopics, uniqueSubtopicNames]);

  const subtopicNameToId = useMemo(() => {
    const map = new Map<string, string>();
    topics.forEach((topic) =>
      topic.subtopics.forEach((subtopic) => {
        map.set(subtopic.subtopic_name, subtopic.subtopic_id);
      }),
    );
    return map;
  }, [topics]);

  const subtopicIdToName = useMemo(() => {
    const map = new Map<string, string>();
    topics.forEach((topic) =>
      topic.subtopics.forEach((subtopic) => {
        map.set(subtopic.subtopic_id, subtopic.subtopic_name);
      }),
    );
    return map;
  }, [topics]);

  const uniqueQuestionTypeNames = useMemo(
    () => Array.from(new Set(questionTypes.map((type) => type.name))),
    [questionTypes],
  );

  const viewQuestions = useMemo<QuestionListItem[]>(() => {
    return questions.map((question) => ({
      id: question.questionId,
      subtopic: subtopicIdToName.get(question.subtopicId) ?? "",
      difficulty: DIFFICULTY_LABELS[question.difficulty] ?? "Regular",
      body: question.body,
      type: questionTypeIdToName.get(question.questionTypeId) ?? "",
      expectedAnswer: question.response ?? "",
      // nunca mostramos el ID crudo; si no hay nombre, texto amigable
      author: authorNames[question.authorId] ?? "Autor desconocido",
      options: question.options?.map((option) => option.text),
    }));
  }, [authorNames, questions, questionTypeIdToName, subtopicIdToName]);

  const loadCatalogs = useCallback(async () => {
    try {
      const [types, fetchedTopics, currentUser] = await Promise.all([
        fetchQuestionTypes(),
        fetchTopics(),
        fetchCurrentUser().catch(() => null),
      ]);

      let teacherId: string | null = null;
      let teacherTeachingSubjectIds: string[] = [];
      let teacherName: string | null = null;
      let userName: string | null = null;

      if (currentUser) {
        userName = (currentUser).name ?? (currentUser).email ?? null;
      }

      if (currentUser?.id) {
        try {
          // Seguimos usando paginado de teachers para mapear de userId -> teacherId
          const teachersPage = await fetchTeachers({ limit: 100, offset: 0 });
          const teacher = teachersPage.data.find((t) => t.userId === currentUser.id);

          if (teacher) {
            teacherId = teacher.id;

            try {
              // Aquí sacamos las asignaturas que IMPARTE el profesor y su nombre
              const teacherDetail = await fetchTeacherDetail(teacherId);
              teacherTeachingSubjectIds =
                (teacherDetail).teaching_subjects_ids ??
                (teacherDetail).subjects_ids ??
                [];
              teacherName = (teacherDetail).name ?? null;
            } catch (err) {
              console.error("No se pudo obtener el detalle del profesor actual", err);
            }
          }
        } catch (err) {
          console.error("No se pudo obtener el teacherId del usuario actual", err);
        }
      }

      setQuestionTypes(types);
      setTopics(fetchedTopics);
      setCurrentUserId(currentUser?.id ?? null);
      setCurrentUserName(userName);
      setCurrentTeacherId(teacherId);
      setCurrentTeacherName(teacherName);
      setTeachingSubjectIds(teacherTeachingSubjectIds);

      // si ya sabemos quién es el teacher actual, precargamos su nombre en el mapa
      if (teacherId && teacherName) {
        setAuthorNames((prev) =>
          prev[teacherId!] ? prev : { ...prev, [teacherId!]: teacherName! },
        );
      }
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const loadQuestions = useCallback(
    async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          q: search || undefined,
          subtopicId: filters.subtopic !== "all" ? subtopicNameToId.get(filters.subtopic) : undefined,
          questionTypeId: filters.type !== "all" ? questionTypeNameToId.get(filters.type) : undefined,
          difficulty:
            filters.difficulty !== "all"
              ? DIFFICULTY_ENUM_BY_LABEL[filters.difficulty as QuestionListItem["difficulty"]]
              : undefined,
          limit: pageSize,
          offset: (page - 1) * pageSize,
        };
        const { data, meta } = await fetchQuestions(params);
        setQuestions(data);
        setTotal(meta.total);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    [filters, page, pageSize, questionTypeNameToId, search, subtopicNameToId],
  );

  useEffect(() => {
    void loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  // Carga perezosa de nombres de autores (asumimos que authorId es teacherId)
  useEffect(() => {
    const uniqueAuthorIds = Array.from(new Set(questions.map((q) => q.authorId)));
    const missingAuthorIds = uniqueAuthorIds.filter((id) => !(id in authorNames));
    if (missingAuthorIds.length === 0) return;

    let cancelled = false;

    const loadAuthors = async () => {
      try {
        const entries = await Promise.all(
          missingAuthorIds.map(async (authorId) => {
            // 1) Si es el teacher actual y ya tenemos su nombre
            if (currentTeacherId && authorId === currentTeacherId && currentTeacherName) {
              return [authorId, currentTeacherName] as const;
            }

            // 2) Intentar como teacher (principal caso)
            try {
              const teacher = await fetchTeacherDetail(authorId);
              const name =
                (teacher).name ??
                (teacher).email ??
                "Autor";
              return [authorId, name] as const;
            } catch {
              // 3) Último recurso: si coincide con el user actual y tenemos su nombre
              if (currentUserId && authorId === currentUserId && currentUserName) {
                return [authorId, currentUserName] as const;
              }
              return [authorId, "Autor desconocido"] as const;
            }
          }),
        );

        if (cancelled) return;

        setAuthorNames((prev) => {
          const next = { ...prev };
          entries.forEach(([id, name]) => {
            if (!next[id]) {
              next[id] = name;
            }
          });
          return next;
        });
      } catch {
        // si algo peta aquí, mejor no spamear la consola
      }
    };

    void loadAuthors();

    return () => {
      cancelled = true;
    };
  }, [
    authorNames,
    questions,
    currentTeacherId,
    currentTeacherName,
    currentUserId,
    currentUserName,
  ]);

  const refresh = useCallback(async () => {
    await loadQuestions();
  }, [loadQuestions]);

  const setFilters = useCallback((next: QuestionFilterValues) => {
    setPageState(1);
    setFiltersState(next);
  }, []);

  const setPage = useCallback((nextPage: number) => {
    setPageState(nextPage < 1 ? 1 : nextPage);
  }, []);

  const create = useCallback(
    async (payload: CreateQuestionPayload) => {
      const created = await createQuestion(payload);

      // Solo insertamos en la página actual cuando estamos en la primera página.
      // Además recortamos para respetar el límite de items por página.
      setQuestions((prev) => {
        if (page !== 1) return prev;
        const next = [created, ...prev];
        return next.slice(0, pageSize);
      });
      setTotal((prev) => (typeof prev === "number" ? prev + 1 : prev));

      // Pre-cargar el nombre del autor si sabemos quién es
      if (created.authorId) {
        setAuthorNames((prev) => {
          if (prev[created.authorId]) return prev;

          let name: string | null = null;

          if (
            currentTeacherId &&
            created.authorId === currentTeacherId &&
            currentTeacherName
          ) {
            name = currentTeacherName;
          } else if (
            currentUserId &&
            created.authorId === currentUserId &&
            currentUserName
          ) {
            name = currentUserName;
          }

          if (!name) return prev;

          return { ...prev, [created.authorId]: name };
        });
      }

      return created;
    },
    [currentTeacherId, currentTeacherName, currentUserId, currentUserName, page, pageSize],
  );

  const update = useCallback(
    async (questionId: string, payload: UpdateQuestionPayload) => {
      const updated = await updateQuestion(questionId, payload);
      setQuestions((prev) =>
        prev.map((question) => (question.questionId === questionId ? updated : question)),
      );
      return updated;
    },
    [],
  );

  const remove = useCallback(async (questionId: string) => {
    await deleteQuestion(questionId);
    setQuestions((prev) => prev.filter((question) => question.questionId !== questionId));
    setTotal((prev) => (typeof prev === "number" ? Math.max(0, prev - 1) : prev));
  }, []);

  return {
    questions: viewQuestions,
    rawQuestions: questions,
    loading,
    error,
    total,
    page,
    pageSize,
    filters,
    search,
    questionTypes,
    topics,
    allSubtopics,
    availableSubtopics,
    uniqueSubtopicNames,
    uniqueQuestionTypeNames,
    setFilters,
    setSearch,
    setPage,
    refresh,
    create,
    update,
    remove,
  };
}
