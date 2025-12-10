import { DifficultyLevelEnum } from "@/types/question-bank/enums/difficultyLevel";

export type AutomaticExamReportRow = {
  examId: string;
  title: string;
  subjectId: string;
  subjectName: string | null;
  creatorId: string;
  creatorName: string | null;
  createdAt: string;
  parameters: Record<string, unknown> | null;
};

export type PopularQuestionsReportRow = {
  questionId: string;
  questionBody: string | null;
  difficulty: DifficultyLevelEnum;
  topicId: string | null;
  topicName: string | null;
  usageCount: number;
};

export type ValidatedExamReportRow = {
  examId: string;
  title: string;
  subjectId: string;
  subjectName: string | null;
  validatedAt: string | null;
  observations: string | null;
  validatorId: string;
};

export type ExamPerformanceRow = {
  examQuestionId: string;
  questionId: string;
  questionIndex: number;
  questionScore: number;
  difficulty: DifficultyLevelEnum;
  topicId: string | null;
  topicName: string | null;
  averageScore: number;
  successRate: number;
  attempts: number;
  questionBody: string | null;
};

export type ExamPerformanceReport = {
  examId: string;
  questions: ExamPerformanceRow[];
  overallSuccessRate: number;
  difficultyGroups: {
    difficulty: DifficultyLevelEnum;
    successRate: number;
    questionCount: number;
  }[];
};

export type SubjectDifficultyDetail = {
  difficulty: DifficultyLevelEnum;
  averageGrade: number | null;
  examCount: number;
};

export type SubjectDifficultyCorrelationRow = {
  subjectId: string;
  subjectName: string | null;
  correlationScore: number;
  difficultyDetails: SubjectDifficultyDetail[];
};

export type TopFailingQuestionRow = {
    questionId: string;
    questionBody: string | null;
    topicId: string | null;
  topicName: string | null;
  subjectId: string | null;
  subjectName: string | null;
  authorId: string | null;
  authorName: string | null;
  failureRate: number;
};

export type RegradeComparisonRow = {
  subjectId: string;
  subjectName: string | null;
  course: string;
  regradeAverage: number | null;
  courseAverage: number | null;
  requests: number;
};

export type SubjectDifficultyReport = {
  subjectCorrelations: SubjectDifficultyCorrelationRow[];
  topFailingQuestions: TopFailingQuestionRow[];
  regradeComparison: RegradeComparisonRow[];
};

export type ExamComparisonTopicDistribution = {
  topicId: string | null;
  topicName: string | null;
  questionCount: number;
};

export type ExamComparisonRow = {
  examId: string;
  title: string;
  subjectId: string;
  subjectName: string | null;
  difficultyDistribution: Record<DifficultyLevelEnum, number>;
  totalQuestions: number;
  topicDistribution: ExamComparisonTopicDistribution[];
  balanceGap: number;
  balanced: boolean;
};

export type ReviewerActivityRow = {
  reviewerId: string;
  reviewerName: string | null;
  subjectId: string;
  subjectName: string | null;
  reviewedExams: number;
};
