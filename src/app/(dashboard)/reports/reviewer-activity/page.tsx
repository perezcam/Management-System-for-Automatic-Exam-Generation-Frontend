"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReportPageShell } from "@/components/dashboard/administration/reports/report-page-shell";
import { ReportPagination } from "@/components/dashboard/administration/reports/report-pagination";
import { useReviewerActivityReport } from "@/hooks/analytics/use-reviewer-activity-report";
import { ReviewerActivitySortByEnum, SortDirectionEnum } from "@/types/analytics";
import { downloadReviewerActivityReportPdf } from "@/services/analytics/reports";

const PAGE_SIZE = 15;

const sortByOptions = [
  { value: ReviewerActivitySortByEnum.REVIEWED_EXAMS, label: "Revisados" },
  { value: ReviewerActivitySortByEnum.TEACHER_NAME, label: "Profesor" },
  { value: ReviewerActivitySortByEnum.SUBJECT_NAME, label: "Asignatura" },
];

const sortOrderOptions = [
  { value: SortDirectionEnum.ASC, label: "Ascendente" },
  { value: SortDirectionEnum.DESC, label: "Descendente" },
];

export default function ReviewerActivityReportPage() {
  const { data, meta, loading, error, load } = useReviewerActivityReport();
  const [sortBy, setSortBy] = useState<ReviewerActivitySortByEnum>(ReviewerActivitySortByEnum.REVIEWED_EXAMS);
  const [sortOrder, setSortOrder] = useState<SortDirectionEnum>(SortDirectionEnum.DESC);
  const [page, setPage] = useState(1);

  const offset = (page - 1) * PAGE_SIZE;

  const hasLoadedResults = useMemo(() => data.length > 0 || !!meta, [data, meta]);

  const handleLoad = useCallback(
    async (targetPage = 1) => {
      await load({
        sortBy,
        sortOrder,
        limit: PAGE_SIZE,
        offset: (targetPage - 1) * PAGE_SIZE,
      });
      setPage(targetPage);
    },
    [load, sortBy, sortOrder],
  );

  const handleDownload = async () => {
    await downloadReviewerActivityReportPdf({
      sortBy,
      sortOrder,
    limit: PAGE_SIZE,
    offset,
  });
};

  useEffect(() => {
    void handleLoad(1);
  }, [handleLoad]);

  return (
    <ReportPageShell
      title="Actividad de revisores"
      description="Consulta cuántos exámenes han validado los revisores por asignatura."
    >
      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sortBy">Ordenar por</Label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as ReviewerActivitySortByEnum)}>
              <SelectTrigger id="sortBy">
                <SelectValue placeholder="Orden" />
              </SelectTrigger>
              <SelectContent>
                {sortByOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sortOrder">Dirección</Label>
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortDirectionEnum)}>
              <SelectTrigger id="sortOrder">
                <SelectValue placeholder="Dirección" />
              </SelectTrigger>
              <SelectContent>
                {sortOrderOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <Button variant="ghost" onClick={() => void handleDownload()} disabled={loading || data.length === 0}>
            Descargar PDF
          </Button>
        </div>
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error.message}
          </div>
        )}
      </Card>

      <Card className="p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando actividad...</p>
        ) : !hasLoadedResults ? (
          <p className="text-sm text-muted-foreground">Aún no se han consultado resultados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-2 py-2">Revisor</th>
                  <th className="px-2 py-2">Asignatura</th>
                  <th className="px-2 py-2">Revisados</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                    <tr key={`${row.reviewerId}-${row.subjectId}`} className="border-t">
                      <td className="px-2 py-3 font-medium text-foreground max-w-[22rem] break-words whitespace-normal">
                        {row.reviewerName ?? row.reviewerId}
                      </td>
                      <td className="px-2 py-3 max-w-[22rem] break-words whitespace-normal">
                        {row.subjectName ?? row.subjectId}
                      </td>
                      <td className="px-2 py-3">{row.reviewedExams}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4">
          <ReportPagination meta={meta} page={page} onPageChange={(next) => void handleLoad(next)} />
        </div>
      </Card>
    </ReportPageShell>
  );
}
