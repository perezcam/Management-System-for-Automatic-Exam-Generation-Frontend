"use client";

import { useMemo } from "react";

import { useQuestionTypes } from "./use-question-type";
import { useSubject } from "./use-subject";
import { useTopics } from "./use-topic";
import { CreateQuestionTypePayload, QuestionTypeDetail } from "@/types/question-administration/question-type";
import { CreateSubjectPayload, SubjectDetail, UpdateSubjectPayload } from "@/types/question-administration/subject";
import { CreateTopicPayload, TopicDetail, UpdateTopicPayload } from "@/types/question-administration/topic";
import { TotalsDetail } from "@/types/question-administration/question_administration";
import { CreateSubtopicPayload, SubTopicDetail } from "@/types/question-administration/subtopic";
import { PaginationMeta } from "@/types/backend-responses";

export type UseQuestionAdministrationResult
 = {
  questionTypes: QuestionTypeDetail[];
  subjects: SubjectDetail[];
  subjectsAll: SubjectDetail[];
  topics: TopicDetail[];
  topicsMeta: PaginationMeta | null;
  topicsAll: TopicDetail[];
  subjectsPage: number;
  subjectsPageSize: number;
  subjectsTotal: number | null;
  subjectsFilter: string;
  topicsPage: number;
  topicsPageSize: number;
  topicsTotal: number | null;
  topicsFilter: string;
  totals: TotalsDetail;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setSubjectsPage: (page: number) => void;
  setTopicsPage: (page: number) => void;
  setSubjectsFilter: (value: string) => void;
  setTopicsFilter: (value: string) => void;
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
  question_types: QuestionTypeDetail[],
  subjects: SubjectDetail[] = [],
  topicsMeta: PaginationMeta | null,
): TotalsDetail => {
  const totalTopics = topicsMeta?.total ?? subjects.reduce(
    (acc, subject) => acc + subject.topics.length,
    0,
  );
  const totalSubtopics = subjects.reduce(
    (acc, subject) =>
      acc + subject.topics.reduce(
        (innerAcc, topic) => innerAcc + topic.subtopics.length,
        0,
      ),
    0,
  );
  return {
    total_question_types: question_types.length,
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

  const paginatedSubjects = useMemo(() => {
    const start = (SUB.page - 1) * SUB.pageSize;
    const end = start + SUB.pageSize;
    return SUB.subjects.slice(start, end);
  }, [SUB.page, SUB.pageSize, SUB.subjects]);

  const allTopics = useMemo(() => {
    const topicMap = new Map<string, TopicDetail>();
    TOP.topics.forEach((topic) => topicMap.set(topic.topic_id, topic));
    SUB.subjects.forEach((subject) => {
      subject.topics.forEach((topic) => {
        if (!topicMap.has(topic.topic_id)) {
          topicMap.set(topic.topic_id, topic);
        }
      });
    });
    return Array.from(topicMap.values());
  }, [SUB.subjects, TOP.topics]);

  const totals = useMemo(
    () => computeTotals(TYP.questionTypes, SUB.subjects, TOP.meta),
    [TYP.questionTypes, SUB.subjects, TOP.meta],
  );
  const loading = TYP.loading || SUB.loading || TOP.loading;
  const error = TYP.error ?? SUB.error ?? TOP.error ?? null;

  const refresh = async () => {
    await Promise.all([TYP.refresh(), SUB.refresh(), TOP.refresh()]);
  };

  return {
    questionTypes: TYP.questionTypes,
    subjects: paginatedSubjects,
    subjectsAll: SUB.subjects,
    topics: TOP.topics,
    topicsMeta: TOP.meta,
    topicsAll: allTopics,
    subjectsPage: SUB.page,
    subjectsPageSize: SUB.pageSize,
    subjectsTotal: SUB.total,
    subjectsFilter: SUB.filter,
    topicsPage: TOP.page,
    topicsPageSize: TOP.pageSize,
    topicsTotal: TOP.total,
    topicsFilter: TOP.filter,
    totals,
    loading,
    error,
    refresh,
    setSubjectsPage: SUB.setPage,
    setTopicsPage: TOP.setPage,
    setSubjectsFilter: SUB.setFilter,
    setTopicsFilter: TOP.setFilter,
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
