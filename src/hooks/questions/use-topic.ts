"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  CreateSubtopicPayload,
  CreateTopicPayload,
  SubTopicDetail,
  TopicDetail,
  UpdateTopicPayload,
  SubjectDetail,
} from "@/types/question_administration";
import {
  createTopic,
  deleteTopic,
  updateTopic,
  fetchTopicsPaginated,
} from "@/services/question-adm/topics-service";
import {
  createSubtopic,
  deleteSubtopic,
} from "@/services/question-adm/subtopics-service";

const PAGE_SIZE = 20;

export type UseTopicsResult = {
  topics: TopicDetail[];
  loading: boolean;
  error: Error | null;

  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  refresh: () => Promise<void>;

  createTopic: (payload: CreateTopicPayload) => Promise<void>;
  updateTopic: (topicId: string, payload: UpdateTopicPayload) => Promise<void>;
  deleteTopic: (topicId: string) => Promise<void>;
  createSubtopic: (payload: CreateSubtopicPayload) => Promise<SubTopicDetail>;
  deleteSubtopic: (subtopicId: string) => Promise<void>;
};

export function useTopics(
  subjects: SubjectDetail[],
  setSubjects: React.Dispatch<React.SetStateAction<SubjectDetail[]>>
): UseTopicsResult {
  const [topics, setTopics] = useState<TopicDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [page, setPage] = useState(0);
  const pageSize = PAGE_SIZE;
  const [total, setTotal] = useState(0);
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;

  const loadPage = useCallback(
    async (pageToLoad: number) => {
      setLoading(true);
      setError(null);

      const offset = pageToLoad * pageSize;

      try {
        const { data, meta } = await fetchTopicsPaginated({
          limit: pageSize,
          offset,
        });

        setTopics(data);
        setTotal(meta.total);
        setPage(pageToLoad);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    void loadPage(0);
  }, [loadPage]);

  const refresh = useCallback(async () => {
    await loadPage(page);
  }, [loadPage, page]);

  const nextPage = useCallback(async () => {
    if (page >= totalPages - 1) return;
    await loadPage(page + 1);
  }, [page, totalPages, loadPage]);

  const prevPage = useCallback(async () => {
    if (page <= 0) return;
    await loadPage(page - 1);
  }, [page, loadPage]);


  const handleCreateTopic = useCallback(
    async (payload: CreateTopicPayload) => {
      const created = await createTopic(payload);

      setSubjects((prev) =>
        prev.map((s) =>
          s.subject_id === created.subject_id
            ? {
                ...s,
                topics: [...s.topics, created],
                topics_amount: s.topics.length + 1,
              }
            : s
        )
      );

      await loadPage(0);
    },
    [setSubjects, loadPage]
  );

  const handleUpdateTopic = useCallback(
    async (topicId: string, payload: UpdateTopicPayload) => {
      const updated = await updateTopic(topicId, payload);

      setSubjects((prev) =>
        prev.map((subject) => {
          const hadTopic = subject.topics.some((t) => t.topic_id === topicId);
          const isNewOwner = subject.subject_id === updated.subject_id;

          if (!hadTopic && !isNewOwner) return subject;

          if (isNewOwner) {
            const filtered = subject.topics.filter((t) => t.topic_id !== topicId);
            return {
              ...subject,
              topics: [...filtered, updated],
              topics_amount: filtered.length + 1,
            };
          }

          return {
            ...subject,
            topics: subject.topics.filter((t) => t.topic_id !== topicId),
            topics_amount: Math.max(0, subject.topics.length - 1),
          };
        })
      );

      await loadPage(page);
    },
    [setSubjects, loadPage, page]
  );

  const handleDeleteTopic = useCallback(
    async (topicId: string) => {
      await deleteTopic(topicId);

      setSubjects((prev) =>
        prev.map((s) => ({
          ...s,
          topics: s.topics.filter((t) => t.topic_id !== topicId),
          topics_amount: s.topics.some((t) => t.topic_id === topicId)
            ? Math.max(0, s.topics.length - 1)
            : s.topics_amount,
        }))
      );

      const isLastInPage = topics.length === 1 && page > 0;
      const targetPage = isLastInPage ? page - 1 : page;
      await loadPage(targetPage);
    },
    [setSubjects, topics.length, page, loadPage]
  );


  const handleCreateSubtopic = useCallback(
    async (payload: CreateSubtopicPayload) => {
      const created = await createSubtopic(payload);

      setSubjects((prev) =>
        prev.map((s) => ({
          ...s,
          topics: s.topics.map((t) =>
            t.topic_id === payload.topic_associated_id
              ? {
                  ...t,
                  subtopics: [...t.subtopics, created],
                  subtopics_amount: t.subtopics.length + 1,
                }
              : t
          ),
        }))
      );

      await loadPage(page);
      return created;
    },
    [setSubjects, loadPage, page]
  );

  const handleDeleteSubtopic = useCallback(
    async (subtopicId: string) => {
      await deleteSubtopic(subtopicId);

      setSubjects((prev) =>
        prev.map((s) => ({
          ...s,
          topics: s.topics.map((t) => {
            const exists = t.subtopics.some(
              (st) => st.subtopic_id === subtopicId
            );
            if (!exists) return t;

            const newSubs = t.subtopics.filter(
              (st) => st.subtopic_id !== subtopicId
            );
            return {
              ...t,
              subtopics: newSubs,
              subtopics_amount: newSubs.length,
            };
          }),
        }))
      );

      await loadPage(page);
    },
    [setSubjects, loadPage, page]
  );

  return {
    topics,
    loading,
    error,
    page,
    pageSize,
    total,
    totalPages,
    nextPage,
    prevPage,
    refresh,
    createTopic: handleCreateTopic,
    updateTopic: handleUpdateTopic,
    deleteTopic: handleDeleteTopic,
    createSubtopic: handleCreateSubtopic,
    deleteSubtopic: handleDeleteSubtopic,
  };
}
