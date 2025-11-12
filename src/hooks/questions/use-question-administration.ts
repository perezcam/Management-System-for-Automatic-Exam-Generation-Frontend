"use client";

import { useMemo } from "react";
import type {
  CreateQuestionTypePayload, CreateSubjectPayload, CreateSubtopicPayload, CreateTopicPayload,
  QuestionTypeDetail, SubjectDetail, SubTopicDetail, TopicDetail, TotalsDetail,
  UpdateSubjectPayload, UpdateTopicPayload
} from "@/types/question_administration";
import { useQuestionTypes } from "./use-question-type";
import { useSubject } from "./use-subject";
import { useTopics } from "./use-topic";

export type UseQuestionAdministrationResult
 = {
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

const computeTotals = (types: QuestionTypeDetail[], subjects: SubjectDetail[]): TotalsDetail => {
  const totalTopics = subjects.reduce((acc, s) => acc + s.topics.length, 0);
  const totalSubtopics = subjects.reduce(
    (acc, s) => acc + s.topics.reduce((acc2, t) => acc2 + t.subtopics.length, 0),
    0
  );
  return {
    total_question_types: types.length,
    total_subjects: subjects.length,
    total_topics: totalTopics,
    total_subtopics: totalSubtopics,
  };
};

export function UseQuestionAdministration(): UseQuestionAdministrationResult
 {
  const TYP = useQuestionTypes();
  const SUB = useSubject();
  const TOP = useTopics(SUB.subjects, SUB.__setSubjects);

  const totals = useMemo(() => computeTotals(TYP.questionTypes, SUB.subjects), [TYP.questionTypes, SUB.subjects]);
  const loading = TYP.loading || SUB.loading; // useTopics no carga nada por sí mismo
  const error = TYP.error ?? SUB.error;

  const refresh = async () => {
    await Promise.all([TYP.refresh(), SUB.refresh()]);
  };

  return {
    questionTypes: TYP.questionTypes,
    subjects: SUB.subjects,
    topics: TOP.topics,
    totals,
    loading,
    error,
    refresh,
    // actions mapeadas
    createQuestionType: TYP.createQuestionType,
    deleteQuestionType: TYP.deleteQuestionType,
    createSubject: SUB.createSubject,
    updateSubject: SUB.updateSubject,
    deleteSubject: SUB.deleteSubject,
    createTopic: TOP.createTopic,
    updateTopic: TOP.updateTopic,
    deleteTopic: TOP.deleteTopic,
    createSubtopic: TOP.createSubtopic,
    deleteSubtopic: TOP.deleteSubtopic,
  };
}
