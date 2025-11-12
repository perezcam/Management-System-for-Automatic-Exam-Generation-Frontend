"use client";

import { useCallback, useMemo } from "react";
import type {
  CreateSubtopicPayload, CreateTopicPayload, SubTopicDetail, TopicDetail, UpdateTopicPayload, SubjectDetail
} from "@/types/question_administration";
import { createSubtopic, createTopic, deleteSubtopic, deleteTopic, updateTopic } from "@/services/question-administration";

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

  const topics = useMemo<TopicDetail[]>(
    () =>
      subjects.flatMap(subject =>
        subject.topics.map(topic => ({
          ...topic,
          subject_id: subject.subject_id,
          subject_name: subject.subject_name,
        }))
      ),
    [subjects]
  );

  const handleCreateTopic = useCallback(async (payload: CreateTopicPayload) => {
    const created = await createTopic(payload);
    setSubjects(prev =>
      prev.map(s =>
        s.subject_id === created.subject_id
          ? { ...s, topics: [...s.topics, created], topics_amount: s.topics.length + 1 }
          : s
      )
    );
  }, [setSubjects]);

  const handleUpdateTopic = useCallback(async (topicId: string, payload: UpdateTopicPayload) => {
    const updated = await updateTopic(topicId, payload);
    setSubjects(prev => {
      return prev.map(subject => {
        const hadTopic = subject.topics.some(t => t.topic_id === topicId);
        const isNewOwner = subject.subject_id === updated.subject_id;

        if (!hadTopic && !isNewOwner) return subject;

        if (isNewOwner) {
          const filtered = subject.topics.filter(t => t.topic_id !== topicId);
          return { ...subject, topics: [...filtered, updated], topics_amount: filtered.length + 1 };
        }
        return {
          ...subject,
          topics: subject.topics.filter(t => t.topic_id !== topicId),
          topics_amount: Math.max(0, subject.topics.length - 1),
        };
      });
    });
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
  }, [setSubjects]);

  const handleCreateSubtopic = useCallback(async (payload: CreateSubtopicPayload) => {
    const created = await createSubtopic(payload);
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
