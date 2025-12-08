import { fetchReviewerActivityReport } from "@/services/analytics/reports";
import type { ReviewerActivityReportParams } from "@/types/analytics/requests";
import type { ReviewerActivityRow } from "@/types/analytics/rows";
import { usePaginatedAnalyticsReport } from "./use-paginated-analytics-report";

export function useReviewerActivityReport() {
  return usePaginatedAnalyticsReport<ReviewerActivityReportParams, ReviewerActivityRow>(
    fetchReviewerActivityReport,
  );
}
