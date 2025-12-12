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
import { useAnalyticsLookups } from "@/hooks/analytics/use-analytics-lookups";
import { useValidatedExamsReport } from "@/hooks/analytics/use-validated-exams-report";
import { SortDirectionEnum, ValidatedExamSortByEnum } from "@/types/analytics";
import { downloadValidatedExamsReportPdf } from "@/services/analytics/reports";

const PAGE_SIZE = 15;

const sortByOptions = [
  { value: ValidatedExamSortByEnum.VALIDATED_AT, label: "Fecha" },
  { value: ValidatedExamSortByEnum.SUBJECT_NAME, label: "Asignatura" },
];

const sortOrderOptions = [
  { value: SortDirectionEnum.ASC, label: "Ascendente" },
  { value: SortDirectionEnum.DESC, label: "Descendente" },
];

export default function ValidatedExamsReportPage() {
  const { subjects, teachers, loading: lookupsLoading } = useAnalyticsLookups();
  const { data, meta, loading, error, load } = useValidatedExamsReport();
  const [reviewerId, setReviewerId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [sortBy, setSortBy] = useState<ValidatedExamSortByEnum>(ValidatedExamSortByEnum.VALIDATED_AT);
  const [sortOrder, setSortOrder] = useState<SortDirectionEnum>(SortDirectionEnum.DESC);
  const [page, setPage] = useState(1);

  const offset = (page - 1) * PAGE_SIZE;

  const hasLoadedResults = useMemo(() => data.length > 0 || !!meta, [data, meta]);

  const handleLoad = useCallback(
    async (targetPage = 1) => {
      if (!reviewerId) return;
      await load({
        reviewerId,
        subjectId: subjectId || undefined,
        sortBy,
        sortOrder,
        limit: PAGE_SIZE,
        offset: (targetPage - 1) * PAGE_SIZE,
      });
      setPage(targetPage);
    },
    [load, reviewerId, subjectId, sortBy, sortOrder],
  );

  const handleDownload = async () => {
    if (!reviewerId) return;
    await downloadValidatedExamsReportPdf({
      reviewerId,
      subjectId: subjectId || undefined,
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
      title="Exámenes validados"
      description="Consulta qué evaluaciones fueron validadas por cada revisor."
    >
      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="reviewer">Revisor</Label>
            <Select
              value={reviewerId || undefined}
              onValueChange={(value) => setReviewerId(value)}
              disabled={lookupsLoading}
            >
              <SelectTrigger id="reviewer">
                <SelectValue placeholder="Selecciona un revisor" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="subject">Asignatura (opcional)</Label>
            <Select
              value={subjectId || undefined}
              onValueChange={(value) => setSubjectId(value === "__none" ? "" : value)}
              disabled={lookupsLoading}
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="Selecciona una asignatura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Sin filtro</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
              ))}
            </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sortBy">Ordenar por</Label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as ValidatedExamSortByEnum)}>
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
          <Button variant="ghost" onClick={() => void handleDownload()} disabled={!reviewerId || data.length === 0}>
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
          <p className="text-sm text-muted-foreground">Cargando resultados...</p>
        ) : !hasLoadedResults ? (
          <p className="text-sm text-muted-foreground">Aún no se han consultado resultados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-2 py-2">Examen</th>
                  <th className="px-2 py-2">Asignatura</th>
                  <th className="px-2 py-2">Validado</th>
                  <th className="px-2 py-2">Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.examId} className="border-t">
                    <td className="px-2 py-3 font-medium text-foreground">{row.title}</td>
                    <td className="px-2 py-3">{row.subjectName ?? row.subjectId}</td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {row.validatedAt
                        ? new Date(row.validatedAt).toLocaleString("es-PE", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "Sin validar"}
                    </td>
                    <td className="px-2 py-3 max-w-[24rem] break-words whitespace-normal">
                      {row.observations ?? "-"}
                    </td>
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
