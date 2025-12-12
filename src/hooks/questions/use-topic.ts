"use client";

import { useCallback, useEffect, useState } from "react";

import { createTopic, deleteTopic, fetchTopics, updateTopic } from "@/services/question-administration/topics";
import { createSubtopic, deleteSubtopic } from "@/services/question-administration/subtopics";
import { CreateTopicPayload, TopicDetail, UpdateTopicPayload } from "@/types/question-administration/topic";
import { CreateSubtopicPayload, SubTopicDetail } from "@/types/question-administration/subtopic";
import { SubjectDetail } from "@/types/question-administration/subject";
import { PaginationMeta } from "@/types/backend-responses";


const PAGE_SIZE = 2;

export type UseTopicsResult = {
  topics: TopicDetail[];
  meta: PaginationMeta | null;
  page: number;
  pageSize: number;
  total: number | null;
  filter: string;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  setFilter: (value: string) => void;
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
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPageState] = useState(1);
  const [filter, setFilterState] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTopicsPage = useCallback(async (targetPage: number, currentFilter: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, meta } = await fetchTopics({
        limit: PAGE_SIZE,
        offset: (targetPage - 1) * PAGE_SIZE,
        q: currentFilter || undefined,
      });
      const total = meta.total;
      const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;
      if (targetPage > totalPages && totalPages > 0) {
        setPageState(totalPages);
        return;
      }
      setTopics(data);
      setMeta(meta);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadTopicsPage(page, filter);
  }, [filter, loadTopicsPage, page]);

  useEffect(() => {
    void loadTopicsPage(page, filter);
  }, [filter, loadTopicsPage, page]);

  const setPage = useCallback((nextPage: number) => {
    setPageState(nextPage < 1 ? 1 : nextPage);
  }, []);

  const setFilter = useCallback((value: string) => {
    setPageState(1);
    setFilterState(value);
  }, []);

  const handleCreateTopic = useCallback(async (payload: CreateTopicPayload) => {
    await createTopic(payload);
    await refresh();
  }, [refresh]);

  const handleUpdateTopic = useCallback(async (topicId: string, payload: UpdateTopicPayload) => {
    const updated = await updateTopic(topicId, payload);
    setSubjects(prev =>
      prev.map(subject => ({
        ...subject,
        topics: subject.topics.map(topic => (topic.topic_id === topicId ? updated : topic)),
      })),
    );
    await refresh();
  }, [refresh, setSubjects]);

  const handleDeleteTopic = useCallback(async (topicId: string) => {
    await deleteTopic(topicId);
    setSubjects(prev =>
      prev.map(s => ({
        ...s,
        topics: s.topics.filter(t => t.topic_id !== topicId),
        topics_amount: s.topics.some(t => t.topic_id === topicId) ? Math.max(0, s.topics.length - 1) : s.topics_amount,
      }))
    );
    await refresh();
  }, [refresh, setSubjects]);

  const handleCreateSubtopic = useCallback(async (payload: CreateSubtopicPayload) => {
    const created = await createSubtopic(payload);
    setTopics(prev =>
      prev.map(t =>
        t.topic_id === payload.topic_associated_id
          ? { ...t, subtopics: [...t.subtopics, created], subtopics_amount: t.subtopics.length + 1 }
          : t,
      ),
    );
    setSubjects(prev =>
      prev.map(s => ({
        ...s,
        topics: s.topics.map(t =>
          t.topic_id === payload.topic_associated_id
            ? { ...t, subtopics: [...t.subtopics, created], subtopics_amount: t.subtopics.length + 1 }
            : t
        ),
      }))
    );
    return created;
  }, [setSubjects]);

  const handleDeleteSubtopic = useCallback(async (subtopicId: string) => {
    await deleteSubtopic(subtopicId);
    setSubjects(prev =>
      prev.map(s => ({
        ...s,
        topics: s.topics.map(t => ({
          ...t,
          subtopics: t.subtopics.filter(st => st.subtopic_id !== subtopicId),
          subtopics_amount: t.subtopics.some(st => st.subtopic_id === subtopicId)
            ? Math.max(0, t.subtopics.length - 1)
            : t.subtopics_amount,
        })),
      }))
    );
    setTopics(prev =>
      prev.map(t => ({
        ...t,
        subtopics: t.subtopics.filter(st => st.subtopic_id !== subtopicId),
        subtopics_amount: t.subtopics.some(st => st.subtopic_id === subtopicId)
          ? Math.max(0, t.subtopics.length - 1)
          : t.subtopics_amount,
      })),
    );
  }, [setSubjects]);

  return {
    topics,
    meta,
    page,
    pageSize: PAGE_SIZE,
    total: meta?.total ?? null,
    filter,
    loading,
    error,
    refresh,
    setPage,
    setFilter,
    createTopic: handleCreateTopic,
    updateTopic: handleUpdateTopic,
    deleteTopic: handleDeleteTopic,
    createSubtopic: handleCreateSubtopic,
    deleteSubtopic: handleDeleteSubtopic,
  };
}
