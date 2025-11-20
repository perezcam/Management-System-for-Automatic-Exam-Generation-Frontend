"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { createQuestion, deleteQuestion, fetchQuestions, updateQuestion } from "@/services/question-bank/questions";
import { fetchQuestionTypes } from "@/services/question-administration/question_types";
import { fetchTopics } from "@/services/question-administration/topics";
import type { QuestionFilterValues, QuestionListItem } from "@/types/question-bank/view";
import type { QuestionDetail, CreateQuestionPayload, UpdateQuestionPayload } from "@/types/question-bank/question";
import { DifficultyLevelEnum } from "@/types/question-bank/enums/difficultyLevel";
import type { QuestionTypeDetail } from "@/types/question-administration/question-type";
import type { TopicDetail } from "@/types/question-administration/topic";
import { fetchUserSummary } from "@/services/users/users";

const DEFAULT_PAGE_SIZE = 10;

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

  const allSubtopics = useMemo(
    () =>
      topics.flatMap((topic) =>
        topic.subtopics.map((subtopic) => ({ id: subtopic.subtopic_id, name: subtopic.subtopic_name })),
      ),
    [topics],
  );

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

  const uniqueSubtopicNames = useMemo(
    () => Array.from(new Set(allSubtopics.map((subtopic) => subtopic.name))),
    [allSubtopics],
  );

  const uniqueQuestionTypeNames = useMemo(
    () => Array.from(new Set(questionTypes.map((type) => type.name))),
    [questionTypes],
  );

  const viewQuestions = useMemo<QuestionListItem[]>(() => {
    return questions.map((question) => ({
      id: question.questionId,
      subtopic: subtopicIdToName.get(question.subtopicId) ?? question.subtopicId,
      difficulty: DIFFICULTY_LABELS[question.difficulty] ?? "Regular",
      body: question.body,
      type: questionTypeIdToName.get(question.questionTypeId) ?? question.questionTypeId,
      expectedAnswer: question.response ?? "",
      author: authorNames[question.authorId] ?? question.authorId,
      options: question.options?.map((option) => option.text),
    }));
  }, [authorNames, questions, questionTypeIdToName, subtopicIdToName]);

  const loadCatalogs = useCallback(async () => {
    try {
      const [types, fetchedTopics] = await Promise.all([fetchQuestionTypes(), fetchTopics()]);
      setQuestionTypes(types);
      setTopics(fetchedTopics);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const loadQuestions = useCallback(async () => {
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
  }, [filters, page, pageSize, questionTypeNameToId, search, subtopicNameToId]);

  useEffect(() => {
    void loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    const uniqueAuthorIds = Array.from(new Set(questions.map((question) => question.authorId)));
    const missingAuthorIds = uniqueAuthorIds.filter((authorId) => !(authorId in authorNames));
    if (missingAuthorIds.length === 0) {
      return;
    }
    let cancelled = false;
    const loadAuthors = async () => {
      try {
        const entries = await Promise.all(
          missingAuthorIds.map(async (authorId) => {
            const user = await fetchUserSummary(authorId);
            return [authorId, user.name] as const;
          }),
        );
        if (cancelled) {
          return;
        }
        setAuthorNames((prev) => {
          const next = { ...prev };
          entries.forEach(([authorId, name]) => {
            next[authorId] = name;
          });
          return next;
        });
      } catch (err) {
        console.error("No se pudo cargar el autor de la pregunta", err);
      }
    };
    void loadAuthors();
    return () => {
      cancelled = true;
    };
  }, [authorNames, questions]);

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

  const create = useCallback(async (payload: CreateQuestionPayload) => {
    const created = await createQuestion(payload);
    setQuestions((prev) => [created, ...prev]);
    setTotal((prev) => (typeof prev === "number" ? prev + 1 : prev));
    return created;
  }, []);

  const update = useCallback(async (questionId: string, payload: UpdateQuestionPayload) => {
    const updated = await updateQuestion(questionId, payload);
    setQuestions((prev) => prev.map((question) => (question.questionId === questionId ? updated : question)));
    return updated;
  }, []);

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
