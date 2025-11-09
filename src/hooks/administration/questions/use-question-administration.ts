import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  CreateQuestionTypePayload,
  CreateSubjectPayload,
  CreateSubtopicPayload,
  CreateTopicPayload,
  QuestionTypeDetail,
  SubjectDetail,
  SubTopicDetail,
  TotalsDetail,
  TopicDetail,
  UpdateSubjectPayload,
  UpdateTopicPayload,
} from "@/types/question-bank/question_administration";
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

type UseQuestionAdministrationResult = {
  questionTypes: QuestionTypeDetail[];
  subjects: SubjectDetail[];
  topics: TopicDetail[];
  totals: TotalsDetail;
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

const emptyTotals: TotalsDetail = {
  total_question_types: 0,
  total_subjects: 0,
  total_topics: 0,
  total_subtopics: 0,
};

const computeTotalsFromState = (types: QuestionTypeDetail[], subjects: SubjectDetail[]): TotalsDetail => {
  const totalTopics = subjects.reduce((acc, subject) => acc + subject.topics.length, 0);
  const totalSubtopics = subjects.reduce(
    (acc, subject) =>
      acc + subject.topics.reduce((topicAcc, topic) => topicAcc + topic.subtopics.length, 0),
    0,
  );

  return {
    total_question_types: types.length,
    total_subjects: subjects.length,
    total_topics: totalTopics,
    total_subtopics: totalSubtopics,
  };
};

export const useQuestionAdministration = (): UseQuestionAdministrationResult => {
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeDetail[]>([]);
  const [subjects, setSubjects] = useState<SubjectDetail[]>([]);
  const [totals, setTotals] = useState<TotalsDetail>(emptyTotals);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadConfiguration = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [typesData, subjectsData] = await Promise.all([fetchQuestionTypes(), fetchSubjects()]);
      setQuestionTypes(typesData);
      setSubjects(subjectsData);

      setTotals(computeTotalsFromState(typesData, subjectsData));
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

  const recalcTotals = useCallback(
    (typesOverride?: QuestionTypeDetail[], subjectsOverride?: SubjectDetail[]) => {
      setTotals(computeTotalsFromState(typesOverride ?? questionTypes, subjectsOverride ?? subjects));
    },
    [questionTypes, subjects],
  );

  const handleCreateQuestionType = useCallback(
    async (payload: CreateQuestionTypePayload) => {
      const created = await createQuestionType(payload);
      setQuestionTypes((prev) => {
        const next = [...prev, created];
        recalcTotals(next);
        return next;
      });
    },
    [recalcTotals],
  );

  const handleDeleteQuestionType = useCallback(
    async (questionTypeId: string) => {
      await deleteQuestionType(questionTypeId);
      setQuestionTypes((prev) => {
        const next = prev.filter((type) => type.question_type_id !== questionTypeId);
        recalcTotals(next);
        return next;
      });
    },
    [recalcTotals],
  );

  const handleCreateSubject = useCallback(
    async (payload: CreateSubjectPayload) => {
      const created = await createSubject(payload);
      setSubjects((prev) => {
        const next = [...prev, created];
        recalcTotals(undefined, next);
        return next;
      });
    },
    [recalcTotals],
  );

  const handleUpdateSubject = useCallback(
    async (subjectId: string, payload: UpdateSubjectPayload) => {
      const updated = await updateSubject(subjectId, payload);
      setSubjects((prev) => {
        const next = prev.map((subject) => (subject.subject_id === subjectId ? updated : subject));
        recalcTotals(undefined, next);
        return next;
      });
    },
    [recalcTotals],
  );

  const handleDeleteSubject = useCallback(
    async (subjectId: string) => {
      await deleteSubject(subjectId);
      setSubjects((prev) => {
        const next = prev.filter((subject) => subject.subject_id !== subjectId);
        recalcTotals(undefined, next);
        return next;
      });
    },
    [recalcTotals],
  );

  const handleCreateTopic = useCallback(
    async (payload: CreateTopicPayload) => {
      const created = await createTopic(payload);
      setSubjects((prev) => {
        const next = prev.map((subject) =>
          subject.subject_id === created.subject_id
            ? {
                ...subject,
                topics: [...subject.topics, created],
                topics_amount: subject.topics.length + 1,
              }
            : subject,
        );
        recalcTotals(undefined, next);
        return next;
      });
    },
    [recalcTotals],
  );

  const handleUpdateTopic = useCallback(
    async (topicId: string, payload: UpdateTopicPayload) => {
      const updated = await updateTopic(topicId, payload);
      setSubjects((prev) => {
        const next = prev.map((subject) => {
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
        recalcTotals(undefined, next);
        return next;
      });
    },
    [recalcTotals],
  );

  const handleDeleteTopic = useCallback(
    async (topicId: string) => {
      await deleteTopic(topicId);
      setSubjects((prev) => {
        const next = prev.map((subject) => ({
          ...subject,
          topics: subject.topics.filter((topic) => topic.topic_id !== topicId),
          topics_amount: subject.topics.some((topic) => topic.topic_id === topicId)
            ? Math.max(0, subject.topics.length - 1)
            : subject.topics_amount,
        }));
        recalcTotals(undefined, next);
        return next;
      });
    },
    [recalcTotals],
  );

  const handleCreateSubtopic = useCallback(
    async (payload: CreateSubtopicPayload) => {
      const created = await createSubtopic(payload);
      setSubjects((prev) => {
        const next = prev.map((subject) => ({
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
        recalcTotals(undefined, next);
        return next;
      });
      return created;
    },
    [recalcTotals],
  );

  const handleDeleteSubtopic = useCallback(
    async (subtopicId: string) => {
      await deleteSubtopic(subtopicId);
      setSubjects((prev) => {
        const next = prev.map((subject) => ({
          ...subject,
          topics: subject.topics.map((topic) => ({
            ...topic,
            subtopics: topic.subtopics.filter((subtopic) => subtopic.subtopic_id !== subtopicId),
            subtopics_amount: topic.subtopics.some((subtopic) => subtopic.subtopic_id === subtopicId)
              ? Math.max(0, topic.subtopics.length - 1)
              : topic.subtopics_amount,
          })),
        }));
        recalcTotals(undefined, next);
        return next;
      });
    },
    [recalcTotals],
  );

  return {
    questionTypes,
    subjects,
    topics,
    totals,
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
  };
};
