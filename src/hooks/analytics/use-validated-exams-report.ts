import { fetchValidatedExamsReport } from "@/services/analytics/reports";
import type { ValidatedExamsReportParams } from "@/types/analytics/requests";
import type { ValidatedExamReportRow } from "@/types/analytics/rows";
import { usePaginatedAnalyticsReport } from "./use-paginated-analytics-report";

export function useValidatedExamsReport() {
  return usePaginatedAnalyticsReport<ValidatedExamsReportParams, ValidatedExamReportRow>(
    fetchValidatedExamsReport,
  );
}
