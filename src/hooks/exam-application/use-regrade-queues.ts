"use client";

import { useCallback, useEffect, useState } from "react";
import { ExamApplicationService } from "@/services/exam-application/exam-application-service";
import { EvaluatorAssignment, PendingRegradeRequest } from "@/types/exam-application/evaluation";

const DEFAULT_PAGE_SIZE = 50;

export function useRegradeQueues() {
  const [assignments, setAssignments] = useState<EvaluatorAssignment[]>([]);
  const [regradeRequests, setRegradeRequests] = useState<PendingRegradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [search, setSearch] = useState("");

  const fetchQueues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const trimmedSearch = search.trim();
      const [assignmentsResp, regradeResp] = await Promise.all([
        ExamApplicationService.listEvaluatorAssignments({
          page: 1,
          limit: DEFAULT_PAGE_SIZE,
          search: trimmedSearch || undefined,
        }),
        ExamApplicationService.listPendingRegradeRequests({
          page: 1,
          limit: DEFAULT_PAGE_SIZE,
          search: trimmedSearch || undefined,
        }),
      ]);

      setAssignments(assignmentsResp.data ?? []);
      setRegradeRequests(regradeResp.data ?? []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void fetchQueues();
  }, [fetchQueues]);

  const refresh = useCallback(async () => {
    await fetchQueues();
  }, [fetchQueues]);

  return {
    assignments,
    regradeRequests,
    loading,
    error,
    search,
    setSearch,
    refresh,
  };
}
