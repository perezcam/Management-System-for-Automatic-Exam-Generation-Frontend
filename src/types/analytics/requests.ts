import {
  AutomaticExamSortByEnum,
  ExamComparisonSortByEnum,
  PopularQuestionSortByEnum,
  ReviewerActivitySortByEnum,
  SortDirectionEnum,
  SubjectDifficultySortByEnum,
  ValidatedExamSortByEnum,
  ReportFormatEnum,
} from "./enums";

export type AnalyticsPaginationParams = {
  limit?: number;
  offset?: number;
};

export type AutomaticExamReportParams = AnalyticsPaginationParams & {
  subjectId: string;
  sortBy?: AutomaticExamSortByEnum;
  sortOrder?: SortDirectionEnum;
};

export type PopularQuestionsReportParams = AnalyticsPaginationParams & {
  subjectId: string;
  sortBy?: PopularQuestionSortByEnum;
  sortOrder?: SortDirectionEnum;
};

export type ValidatedExamsReportParams = AnalyticsPaginationParams & {
  reviewerId: string;
  subjectId?: string;
  sortBy?: ValidatedExamSortByEnum;
  sortOrder?: SortDirectionEnum;
};

export type ExamPerformanceParams = {
  examId: string;
};

export type SubjectDifficultyReportParams = AnalyticsPaginationParams & {
  subjectIds?: string[];
  sortBy?: SubjectDifficultySortByEnum;
  sortOrder?: SortDirectionEnum;
};

export type ExamComparisonReportParams = AnalyticsPaginationParams & {
  subjectIds?: string[];
  sortBy?: ExamComparisonSortByEnum;
  sortOrder?: SortDirectionEnum;
  balanceThreshold?: number;
};

export type ReviewerActivityReportParams = AnalyticsPaginationParams & {
  sortBy?: ReviewerActivitySortByEnum;
  sortOrder?: SortDirectionEnum;
};

export type AnalyticsReportFormat = ReportFormatEnum;
