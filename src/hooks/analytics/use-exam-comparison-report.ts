import { fetchExamComparisonReport } from "@/services/analytics/reports";
import type { ExamComparisonReportParams } from "@/types/analytics/requests";
import type { ExamComparisonRow } from "@/types/analytics/rows";
import { usePaginatedAnalyticsReport } from "./use-paginated-analytics-report";

export function useExamComparisonReport() {
  return usePaginatedAnalyticsReport<ExamComparisonReportParams, ExamComparisonRow>(
    fetchExamComparisonReport,
  );
}
