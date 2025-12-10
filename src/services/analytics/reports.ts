import type { PaginatedSchema } from "@/types/backend-responses";
import type {
  AutomaticExamReportParams,
  ExamComparisonReportParams,
  PopularQuestionsReportParams,
  ReviewerActivityReportParams,
  SubjectDifficultyReportParams,
  ValidatedExamsReportParams,
  ExamPerformanceParams,
} from "@/types/analytics/requests";
import type {
  AutomaticExamReportRow,
  ExamComparisonRow,
  ExamPerformanceReport,
  PopularQuestionsReportRow,
  ReviewerActivityRow,
  SubjectDifficultyReport,
  ValidatedExamReportRow,
} from "@/types/analytics/rows";
import { ANALYTICS_ENDPOINTS, PaginatedResult, withQueryParams } from "@/services/api/endpoints";
import { backendRequest, backendRequestRaw } from "@/services/api-client";
import { ReportFormatEnum } from "@/types/analytics/enums";
import type { QueryParams } from "@/services/api/endpoints";

const MAX_ANALYTICS_LIMIT = 100;

const clampLimit = (value: number | string | undefined): string | number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const raw = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(raw)) return undefined;
  return Math.min(raw, MAX_ANALYTICS_LIMIT);
};

const normalizeQueryParams = (params: QueryParams): QueryParams => {
  const normalized: QueryParams = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "limit") {
      const clamped = clampLimit(value);
      if (clamped !== undefined) {
        normalized[key] = clamped;
      }
      return;
    }
    if (Array.isArray(value)) {
      normalized[key] = value.join(",");
      return;
    }
    normalized[key] = value;
  });
  return normalized;
};

const downloadFile = async (url: string, filename: string) => {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) {
    throw new Error("No fue posible descargar el PDF");
  }
  const blob = await response.blob();
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(href);
};

const buildAnalyticsUrl = (endpoint: string, params: QueryParams = {}) =>
  withQueryParams(endpoint, normalizeQueryParams(params));

const downloadAnalyticsPdf = async (endpoint: string, params: QueryParams = {}, filename: string) => {
  const query = normalizeQueryParams({
    ...params,
    format: ReportFormatEnum.PDF,
  });
  const url = withQueryParams(endpoint, query);
  await downloadFile(url, filename);
};

const toPaginatedResult = <T>(resp: PaginatedSchema<T>): PaginatedResult<T> => ({
  data: resp.data ?? [],
  meta: resp.meta,
});

export const fetchAutomaticExamsReport = async (
  params: AutomaticExamReportParams,
): Promise<PaginatedResult<AutomaticExamReportRow>> => {
  const url = buildAnalyticsUrl(ANALYTICS_ENDPOINTS.automaticExams, params);
  const resp = await backendRequest<PaginatedSchema<AutomaticExamReportRow>>(url);
  return toPaginatedResult(resp);
};

export const downloadAutomaticExamsReportPdf = async (params: AutomaticExamReportParams) => {
  await downloadAnalyticsPdf(ANALYTICS_ENDPOINTS.automaticExams, params, "automatic-exams.pdf");
};

export const fetchPopularQuestionsReport = async (
  params: PopularQuestionsReportParams,
): Promise<PaginatedResult<PopularQuestionsReportRow>> => {
  const url = buildAnalyticsUrl(ANALYTICS_ENDPOINTS.popularQuestions, params);
  const resp = await backendRequest<PaginatedSchema<PopularQuestionsReportRow>>(url);
  return toPaginatedResult(resp);
};

export const downloadPopularQuestionsReportPdf = async (params: PopularQuestionsReportParams) => {
  await downloadAnalyticsPdf(ANALYTICS_ENDPOINTS.popularQuestions, params, "popular-questions.pdf");
};

export const fetchValidatedExamsReport = async (
  params: ValidatedExamsReportParams,
): Promise<PaginatedResult<ValidatedExamReportRow>> => {
  const url = buildAnalyticsUrl(ANALYTICS_ENDPOINTS.validatedExams, params);
  const resp = await backendRequest<PaginatedSchema<ValidatedExamReportRow>>(url);
  return toPaginatedResult(resp);
};

export const downloadValidatedExamsReportPdf = async (params: ValidatedExamsReportParams) => {
  await downloadAnalyticsPdf(ANALYTICS_ENDPOINTS.validatedExams, params, "validated-exams.pdf");
};

export const fetchExamPerformanceReport = async (
  params: ExamPerformanceParams,
): Promise<ExamPerformanceReport> => {
  const url = ANALYTICS_ENDPOINTS.examPerformance(params.examId);
  const resp = await backendRequestRaw<ExamPerformanceReport>(url);
  return resp;
};

export const downloadExamPerformanceReportPdf = async (examId: string) => {
  await downloadAnalyticsPdf(ANALYTICS_ENDPOINTS.examPerformance(examId), {}, "exam-performance.pdf");
};

export const fetchSubjectDifficultyReport = async (
  params: SubjectDifficultyReportParams,
): Promise<SubjectDifficultyReport> => {
  const url = buildAnalyticsUrl(ANALYTICS_ENDPOINTS.subjectDifficulty, params);
  const resp = await backendRequestRaw<SubjectDifficultyReport>(url);
  return resp;
};

export const downloadSubjectDifficultyReportPdf = async (params: SubjectDifficultyReportParams) => {
  await downloadAnalyticsPdf(ANALYTICS_ENDPOINTS.subjectDifficulty, params, "subject-difficulty.pdf");
};

export const fetchExamComparisonReport = async (
  params: ExamComparisonReportParams,
): Promise<PaginatedResult<ExamComparisonRow>> => {
  const url = buildAnalyticsUrl(ANALYTICS_ENDPOINTS.examComparison, params);
  const resp = await backendRequest<PaginatedSchema<ExamComparisonRow>>(url);
  return toPaginatedResult(resp);
};

export const downloadExamComparisonReportPdf = async (params: ExamComparisonReportParams) => {
  await downloadAnalyticsPdf(ANALYTICS_ENDPOINTS.examComparison, params, "exam-comparison.pdf");
};

export const fetchReviewerActivityReport = async (
  params: ReviewerActivityReportParams,
): Promise<PaginatedResult<ReviewerActivityRow>> => {
  const url = buildAnalyticsUrl(ANALYTICS_ENDPOINTS.reviewerActivity, params);
  const resp = await backendRequest<PaginatedSchema<ReviewerActivityRow>>(url);
  return toPaginatedResult(resp);
};

export const downloadReviewerActivityReportPdf = async (params: ReviewerActivityReportParams) => {
  await downloadAnalyticsPdf(ANALYTICS_ENDPOINTS.reviewerActivity, params, "reviewer-activity.pdf");
};
