import { useCallback, useState } from "react";
import type { PaginationMeta } from "@/types/backend-responses";
import type { PaginatedResult } from "@/services/api/endpoints";

type PaginatedFetcher<TParams extends object, TRow> = (
  params: TParams,
) => Promise<PaginatedResult<TRow>>;

export type UsePaginatedAnalyticsReportResult<TParams extends object, TRow> = {
  data: TRow[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: Error | null;
  load: (params: TParams) => Promise<void>;
  refresh: () => Promise<void>;
};

export function usePaginatedAnalyticsReport<TParams extends object, TRow>(
  fetcher: PaginatedFetcher<TParams, TRow>,
): UsePaginatedAnalyticsReportResult<TParams, TRow> {
  const [data, setData] = useState<TRow[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastParams, setLastParams] = useState<TParams | null>(null);

  const load = useCallback(
    async (params: TParams) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetcher(params);
        setData(result.data);
        setMeta(result.meta);
        setLastParams(params);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    [fetcher],
  );

  const refresh = useCallback(async () => {
    if (!lastParams) return;
    await load(lastParams);
  }, [lastParams, load]);

  return { data, meta, loading, error, load, refresh };
}
