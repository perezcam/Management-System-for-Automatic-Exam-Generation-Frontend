"use client";

import { useMemo } from "react";
import type {
  CreateQuestionTypePayload, CreateSubjectPayload, CreateSubtopicPayload, CreateTopicPayload,
  QuestionTypeDetail, SubjectDetail, SubTopicDetail, TopicDetail, TotalsDetail,
  UpdateSubjectPayload, UpdateTopicPayload
} from "@/types/question-administration/question_administration";
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
  attachTopicToSubject: (subjectId: string, topicId: string) => Promise<void>;
  detachTopicFromSubject: (subjectId: string, topicId: string) => Promise<void>;
  createTopic: (payload: CreateTopicPayload) => Promise<void>;
  updateTopic: (topicId: string, payload: UpdateTopicPayload) => Promise<void>;
  deleteTopic: (topicId: string) => Promise<void>;
  createSubtopic: (payload: CreateSubtopicPayload) => Promise<SubTopicDetail>;
  deleteSubtopic: (subtopicId: string) => Promise<void>;
};

const computeTotals = (
  types: QuestionTypeDetail[],
  subjects: SubjectDetail[],
  topics: TopicDetail[],
): TotalsDetail => {
  const totalTopics = topics.length;
  const totalSubtopics = topics.reduce(
    (acc, t) => acc + t.subtopics.length,
    0,
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

  const totals = useMemo(
    () => computeTotals(TYP.questionTypes, SUB.subjects, TOP.topics),
    [TYP.questionTypes, SUB.subjects, TOP.topics],
  );
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
    attachTopicToSubject: SUB.attachTopicToSubject,
    detachTopicFromSubject: SUB.detachTopicFromSubject,
    createTopic: TOP.createTopic,
    updateTopic: TOP.updateTopic,
    deleteTopic: TOP.deleteTopic,
    createSubtopic: TOP.createSubtopic,
    deleteSubtopic: TOP.deleteSubtopic,
  };
}
