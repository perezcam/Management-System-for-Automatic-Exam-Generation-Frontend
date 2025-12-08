import { useCallback, useState } from "react";
import { fetchExamPerformanceReport } from "@/services/analytics/reports";
import type { ExamPerformanceParams } from "@/types/analytics/requests";
import type { ExamPerformanceReport } from "@/types/analytics/rows";

export function useExamPerformanceReport() {
  const [report, setReport] = useState<ExamPerformanceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastParams, setLastParams] = useState<ExamPerformanceParams | null>(null);

  const load = useCallback(async (params: ExamPerformanceParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExamPerformanceReport(params);
      setReport(data);
      setLastParams(params);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!lastParams) return;
    await load(lastParams);
  }, [lastParams, load]);

  return { report, loading, error, load, refresh };
}
