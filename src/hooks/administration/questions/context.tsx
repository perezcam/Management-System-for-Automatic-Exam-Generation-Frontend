import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type {
  CreateQuestionTypePayload,
  CreateSubjectPayload,
  CreateSubtopicPayload,
  CreateTopicPayload,
  QuestionTypeDetail,
  SubjectDetail,
  SubTopicDetail,
  TopicDetail,
  UpdateSubjectPayload,
  UpdateTopicPayload,
} from "@/types/question-bank";
import {
  createQuestionType,
  createSubject,
  createSubtopic,
  createTopic,
  deleteQuestionType,
  deleteSubject,
  deleteSubtopic,
  deleteTopic,
  fetchQuestionTypes,
  fetchSubjects,
  updateSubject,
  updateTopic,
} from "@/services/question-administration";

type QuestionBankContextValue = {
  questionTypes: QuestionTypeDetail[];
  subjects: SubjectDetail[];
  topics: TopicDetail[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createQuestionType: (payload: CreateQuestionTypePayload) => Promise<void>;
  deleteQuestionType: (questionTypeId: string) => Promise<void>;
  createSubject: (payload: CreateSubjectPayload) => Promise<void>;
  updateSubject: (subjectId: string, payload: UpdateSubjectPayload) => Promise<void>;
  deleteSubject: (subjectId: string) => Promise<void>;
  createTopic: (payload: CreateTopicPayload) => Promise<void>;
  updateTopic: (topicId: string, payload: UpdateTopicPayload) => Promise<void>;
  deleteTopic: (topicId: string) => Promise<void>;
  createSubtopic: (payload: CreateSubtopicPayload) => Promise<SubTopicDetail>;
  deleteSubtopic: (subtopicId: string) => Promise<void>;
};

const QuestionBankContext = createContext<QuestionBankContextValue | undefined>(undefined);

export const QuestionBankProvider = ({ children }: { children: React.ReactNode }) => {
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeDetail[]>([]);
  const [subjects, setSubjects] = useState<SubjectDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadConfiguration = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [typesData, subjectsData] = await Promise.all([fetchQuestionTypes(), fetchSubjects()]);
      setQuestionTypes(typesData);
      setSubjects(subjectsData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConfiguration();
  }, [loadConfiguration]);

  const topics = useMemo(
    () =>
      subjects.flatMap((subject) =>
        subject.topics.map((topic) => ({
          ...topic,
          subject_id: subject.subject_id,
          subject_name: subject.subject_name,
        })),
      ),
    [subjects],
  );

  const handleCreateQuestionType = useCallback(
    async (payload: CreateQuestionTypePayload) => {
      const created = await createQuestionType(payload);
      setQuestionTypes((prev) => {
        return [...prev, created];
      });
    },
    [],
  );

  const handleDeleteQuestionType = useCallback(
    async (questionTypeId: string) => {
      await deleteQuestionType(questionTypeId);
      setQuestionTypes((prev) => {
        return prev.filter((type) => type.question_type_id !== questionTypeId);
      });
    },
    [],
  );

  const handleCreateSubject = useCallback(
    async (payload: CreateSubjectPayload) => {
      const created = await createSubject(payload);
      setSubjects((prev) => {
        return [...prev, created];
      });
    },
    [],
  );

  const handleUpdateSubject = useCallback(
    async (subjectId: string, payload: UpdateSubjectPayload) => {
      const updated = await updateSubject(subjectId, payload);
      setSubjects((prev) => {
        return prev.map((subject) => (subject.subject_id === subjectId ? updated : subject));
      });
    },
    [],
  );

  const handleDeleteSubject = useCallback(
    async (subjectId: string) => {
      await deleteSubject(subjectId);
      setSubjects((prev) => {
        return prev.filter((subject) => subject.subject_id !== subjectId);
      });
    },
    [],
  );

  const handleCreateTopic = useCallback(
    async (payload: CreateTopicPayload) => {
      const created = await createTopic(payload);
      setSubjects((prev) => {
        return prev.map((subject) =>
          subject.subject_id === created.subject_id
            ? {
                ...subject,
                topics: [...subject.topics, created],
                topics_amount: subject.topics.length + 1,
              }
            : subject,
        );
      });
    },
    [],
  );

  const handleUpdateTopic = useCallback(
    async (topicId: string, payload: UpdateTopicPayload) => {
      const updated = await updateTopic(topicId, payload);
      setSubjects((prev) => {
        return prev.map((subject) => {
          const topicBelongsToSubject = subject.topics.some((topic) => topic.topic_id === topicId);
          const shouldReceiveTopic = subject.subject_id === updated.subject_id;

          if (!topicBelongsToSubject && !shouldReceiveTopic) {
            return subject;
          }

          if (shouldReceiveTopic) {
            const filteredTopics = subject.topics.filter((topic) => topic.topic_id !== topicId);
            return {
              ...subject,
              topics: [...filteredTopics, updated],
              topics_amount: filteredTopics.length + 1,
            };
          }

          return {
            ...subject,
            topics: subject.topics.filter((topic) => topic.topic_id !== topicId),
            topics_amount: Math.max(0, subject.topics.length - 1),
          };
        });
      });
    },
    [],
  );

  const handleDeleteTopic = useCallback(
    async (topicId: string) => {
      await deleteTopic(topicId);
      setSubjects((prev) => {
        return prev.map((subject) => ({
          ...subject,
          topics: subject.topics.filter((topic) => topic.topic_id !== topicId),
          topics_amount: subject.topics.some((topic) => topic.topic_id === topicId)
            ? Math.max(0, subject.topics.length - 1)
            : subject.topics_amount,
        }));
      });
    },
    [],
  );

  const handleCreateSubtopic = useCallback(
    async (payload: CreateSubtopicPayload) => {
      const created = await createSubtopic(payload);
      setSubjects((prev) => {
        return prev.map((subject) => ({
          ...subject,
          topics: subject.topics.map((topic) =>
            topic.topic_id === payload.topic_associated_id
              ? {
                  ...topic,
                  subtopics: [...topic.subtopics, created],
                  subtopics_amount: topic.subtopics.length + 1,
                }
              : topic,
          ),
        }));
      });
      return created;
    },
    [],
  );

  const handleDeleteSubtopic = useCallback(
    async (subtopicId: string) => {
      await deleteSubtopic(subtopicId);
      setSubjects((prev) => {
        return prev.map((subject) => ({
          ...subject,
          topics: subject.topics.map((topic) => ({
            ...topic,
            subtopics: topic.subtopics.filter((subtopic) => subtopic.subtopic_id !== subtopicId),
            subtopics_amount: topic.subtopics.some((subtopic) => subtopic.subtopic_id === subtopicId)
              ? Math.max(0, topic.subtopics.length - 1)
              : topic.subtopics_amount,
          })),
        }));
      });
    },
    [],
  );

  const value = useMemo<QuestionBankContextValue>(
    () => ({
      questionTypes,
      subjects,
      topics,
      loading,
      error,
      refresh: loadConfiguration,
      createQuestionType: handleCreateQuestionType,
      deleteQuestionType: handleDeleteQuestionType,
      createSubject: handleCreateSubject,
      updateSubject: handleUpdateSubject,
      deleteSubject: handleDeleteSubject,
      createTopic: handleCreateTopic,
      updateTopic: handleUpdateTopic,
      deleteTopic: handleDeleteTopic,
      createSubtopic: handleCreateSubtopic,
      deleteSubtopic: handleDeleteSubtopic,
    }),
    [
      questionTypes,
      subjects,
      topics,
      loading,
      error,
      loadConfiguration,
      handleCreateQuestionType,
      handleDeleteQuestionType,
      handleCreateSubject,
      handleUpdateSubject,
      handleDeleteSubject,
      handleCreateTopic,
      handleUpdateTopic,
      handleDeleteTopic,
      handleCreateSubtopic,
      handleDeleteSubtopic,
    ],
  );

  return <QuestionBankContext.Provider value={value}>{children}</QuestionBankContext.Provider>;
};

export const useQuestionBankContext = () => {
  const context = useContext(QuestionBankContext);
  if (!context) {
    throw new Error("useQuestionBankContext debe usarse dentro de QuestionBankProvider");
  }
  return context;
};
