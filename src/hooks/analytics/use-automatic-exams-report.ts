import { fetchAutomaticExamsReport } from "@/services/analytics/reports";
import type { AutomaticExamReportParams } from "@/types/analytics/requests";
import type { AutomaticExamReportRow } from "@/types/analytics/rows";
import { usePaginatedAnalyticsReport } from "./use-paginated-analytics-report";

export function useAutomaticExamsReport() {
  return usePaginatedAnalyticsReport<AutomaticExamReportParams, AutomaticExamReportRow>(
    fetchAutomaticExamsReport,
  );
}
