import { useCallback, useState } from "react";
import { fetchSubjectDifficultyReport } from "@/services/analytics/reports";
import type { SubjectDifficultyReportParams } from "@/types/analytics/requests";
import type { SubjectDifficultyReport } from "@/types/analytics/rows";

export function useSubjectDifficultyReport() {
  const [report, setReport] = useState<SubjectDifficultyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastParams, setLastParams] = useState<SubjectDifficultyReportParams | null>(null);

  const load = useCallback(
    async (params: SubjectDifficultyReportParams) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSubjectDifficultyReport(params);
        setReport(data);
        setLastParams(params);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (!lastParams) return;
    await load(lastParams);
  }, [lastParams, load]);

  return { report, loading, error, load, refresh };
}
