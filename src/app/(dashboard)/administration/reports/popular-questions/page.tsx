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
import { usePopularQuestionsReport } from "@/hooks/analytics/use-popular-questions-report";
import { PopularQuestionSortByEnum, SortDirectionEnum } from "@/types/analytics";
import { downloadPopularQuestionsReportPdf } from "@/services/analytics/reports";

const PAGE_SIZE = 15;

const sortByOptions = [
  { value: PopularQuestionSortByEnum.USAGE_COUNT, label: "Usos" },
  { value: PopularQuestionSortByEnum.DIFFICULTY, label: "Dificultad" },
  { value: PopularQuestionSortByEnum.TOPIC_NAME, label: "Tema" },
];

const sortOrderOptions = [
  { value: SortDirectionEnum.ASC, label: "Ascendente" },
  { value: SortDirectionEnum.DESC, label: "Descendente" },
];

export default function PopularQuestionsReportPage() {
  const { subjects, loading: lookupsLoading } = useAnalyticsLookups();
  const { data, meta, loading, error, load } = usePopularQuestionsReport();
  const [subjectId, setSubjectId] = useState<string>("");
  const [sortBy, setSortBy] = useState<PopularQuestionSortByEnum>(PopularQuestionSortByEnum.USAGE_COUNT);
  const [sortOrder, setSortOrder] = useState<SortDirectionEnum>(SortDirectionEnum.DESC);
  const [page, setPage] = useState(1);

  const offset = (page - 1) * PAGE_SIZE;

  const hasLoadedResults = useMemo(() => data.length > 0 || !!meta, [data, meta]);

  const handleLoad = useCallback(
    async (targetPage = page) => {
      if (!subjectId) return;
      await load({ subjectId, sortBy, sortOrder, limit: PAGE_SIZE, offset: (targetPage - 1) * PAGE_SIZE });
      setPage(targetPage);
    },
    [load, page, subjectId, sortBy, sortOrder],
  );

  const handleDownload = async () => {
    if (!subjectId) return;
    await downloadPopularQuestionsReportPdf({
      subjectId,
      sortBy,
      sortOrder,
      limit: PAGE_SIZE,
      offset,
    });
  };

  useEffect(() => {
    void handleLoad(1);
  }, [subjectId, sortBy, sortOrder, handleLoad]);

  return (
    <ReportPageShell
      title="Preguntas más utilizadas"
      description="Conoce qué preguntas se repiten con mayor frecuencia en los exámenes."
    >
      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="subject">Asignatura</Label>
            <Select
              value={subjectId || undefined}
              onValueChange={(value) => setSubjectId(value)}
              disabled={lookupsLoading}
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="Selecciona una asignatura" />
              </SelectTrigger>
              <SelectContent>
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
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as PopularQuestionSortByEnum)}>
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
          <Button variant="ghost" onClick={() => void handleDownload()} disabled={!subjectId || data.length === 0}>
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
                  <th className="px-2 py-2">Pregunta</th>
                  <th className="px-2 py-2">Tema</th>
                  <th className="px-2 py-2">Dificultad</th>
                  <th className="px-2 py-2">Usos</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.questionId} className="border-t">
                    <td className="px-2 py-3 font-medium text-foreground max-w-[28rem] break-words whitespace-normal">
                      {row.questionBody ?? row.questionId}
                    </td>
                    <td className="px-2 py-3">{row.topicName ?? "Sin tema"}</td>
                    <td className="px-2 py-3 capitalize">{row.difficulty.toLowerCase()}</td>
                    <td className="px-2 py-3">{row.usageCount}</td>
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
