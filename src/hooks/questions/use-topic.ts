"use client";

import { useCallback, useEffect, useState } from "react";

import { createTopic, deleteTopic, fetchTopics, updateTopic } from "@/services/question-administration/topics";
import { createSubtopic, deleteSubtopic } from "@/services/question-administration/subtopics";
import { CreateTopicPayload, TopicDetail, UpdateTopicPayload } from "@/types/question-administration/topic";
import { CreateSubtopicPayload, SubTopicDetail } from "@/types/question-administration/subtopic";
import { SubjectDetail } from "@/types/question-administration/subject";


const PAGE_SIZE = 2;

export type UseTopicsResult = {
  topics: TopicDetail[];
  page: number;
  pageSize: number;
  total: number | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
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
  const [page, setPageState] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchTopics();
      setTopics(data);
      setTotal(data.length);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setPage = useCallback((nextPage: number) => {
    setPageState(nextPage < 1 ? 1 : nextPage);
  }, []);

  const handleCreateTopic = useCallback(async (payload: CreateTopicPayload) => {
    const created = await createTopic(payload);
    setTopics(prev => [...prev, created]);
    setTotal((prev) => (typeof prev === "number" ? prev + 1 : prev));
  }, []);

  const handleUpdateTopic = useCallback(async (topicId: string, payload: UpdateTopicPayload) => {
    const updated = await updateTopic(topicId, payload);
    setTopics(prev => prev.map(t => (t.topic_id === topicId ? updated : t)));
    setSubjects(prev =>
      prev.map(subject => ({
        ...subject,
        topics: subject.topics.map(topic => (topic.topic_id === topicId ? updated : topic)),
      })),
    );
  }, [setSubjects]);

  const handleDeleteTopic = useCallback(async (topicId: string) => {
    await deleteTopic(topicId);
    setSubjects(prev =>
      prev.map(s => ({
        ...s,
        topics: s.topics.filter(t => t.topic_id !== topicId),
        topics_amount: s.topics.some(t => t.topic_id === topicId) ? Math.max(0, s.topics.length - 1) : s.topics_amount,
      }))
    );
    setTopics(prev => prev.filter(t => t.topic_id !== topicId));
    setTotal((prev) => (typeof prev === "number" ? Math.max(0, prev - 1) : prev));
  }, [setSubjects]);

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
    page,
    pageSize: PAGE_SIZE,
    total,
    loading,
    error,
    refresh,
    setPage,
    createTopic: handleCreateTopic,
    updateTopic: handleUpdateTopic,
    deleteTopic: handleDeleteTopic,
    createSubtopic: handleCreateSubtopic,
    deleteSubtopic: handleDeleteSubtopic,
  };
}
