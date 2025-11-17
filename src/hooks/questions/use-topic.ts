"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  CreateSubtopicPayload, CreateTopicPayload, SubTopicDetail, TopicDetail, UpdateTopicPayload, SubjectDetail
} from "@/types/question-administration/question_administration";
import { createTopic, deleteTopic, fetchTopics, updateTopic } from "@/services/question-administration/topics";
import { createSubtopic, deleteSubtopic } from "@/services/question-administration/subtopics";


export type UseTopicsResult = {
  topics: TopicDetail[]; 
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

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const data = await fetchTopics();
        setTopics(data);
      } catch {
      }
    };
    void loadTopics();
  }, []);

  const handleCreateTopic = useCallback(async (payload: CreateTopicPayload) => {
    const created = await createTopic(payload);
    setTopics(prev => [...prev, created]);
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
    createTopic: handleCreateTopic,
    updateTopic: handleUpdateTopic,
    deleteTopic: handleDeleteTopic,
    createSubtopic: handleCreateSubtopic,
    deleteSubtopic: handleDeleteSubtopic,
  };
}
