import { fetchPopularQuestionsReport } from "@/services/analytics/reports";
import type { PopularQuestionsReportParams } from "@/types/analytics/requests";
import type { PopularQuestionsReportRow } from "@/types/analytics/rows";
import { usePaginatedAnalyticsReport } from "./use-paginated-analytics-report";

export function usePopularQuestionsReport() {
  return usePaginatedAnalyticsReport<PopularQuestionsReportParams, PopularQuestionsReportRow>(
    fetchPopularQuestionsReport,
  );
}
