"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useExamComparisonReport } from "@/hooks/analytics/use-exam-comparison-report";
import { ExamComparisonSortByEnum, SortDirectionEnum } from "@/types/analytics";
import { downloadExamComparisonReportPdf } from "@/services/analytics/reports";

const PAGE_SIZE = 10;

const sortByOptions = [
  { value: ExamComparisonSortByEnum.CREATED_AT, label: "Creación" },
  { value: ExamComparisonSortByEnum.EXAM_TITLE, label: "Examen" },
  { value: ExamComparisonSortByEnum.SUBJECT_NAME, label: "Asignatura" },
];

const sortOrderOptions = [
  { value: SortDirectionEnum.ASC, label: "Ascendente" },
  { value: SortDirectionEnum.DESC, label: "Descendente" },
];

export default function ExamComparisonReportPage() {
  const { subjects, loading: lookupsLoading } = useAnalyticsLookups();
  const { data, meta, loading, error, load } = useExamComparisonReport();
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [pendingSubjectId, setPendingSubjectId] = useState<string | undefined>();
  const [balanceThreshold, setBalanceThreshold] = useState(0.2);
  const [sortBy, setSortBy] = useState<ExamComparisonSortByEnum>(ExamComparisonSortByEnum.CREATED_AT);
  const [sortOrder, setSortOrder] = useState<SortDirectionEnum>(SortDirectionEnum.DESC);
  const [page, setPage] = useState(1);

  const offset = (page - 1) * PAGE_SIZE;

  const hasLoadedResults = useMemo(() => data.length > 0 || !!meta, [data, meta]);

  const availableSubjects = subjects.filter((subject) => !subjectIds.includes(subject.id));

  const handleLoad = useCallback(
    async (targetPage = 1) => {
      await load({
        subjectIds: subjectIds.length ? subjectIds : undefined,
        sortBy,
        sortOrder,
        balanceThreshold,
        limit: PAGE_SIZE,
        offset: (targetPage - 1) * PAGE_SIZE,
      });
      setPage(targetPage);
    },
    [load, balanceThreshold, sortBy, sortOrder, subjectIds],
  );

  const handleDownload = async () => {
    await downloadExamComparisonReportPdf({
      subjectIds: subjectIds.length ? subjectIds : undefined,
      sortBy,
      sortOrder,
      balanceThreshold,
      limit: PAGE_SIZE,
      offset,
    });
  };

  const addSubject = (value: string) => {
    setPendingSubjectId(undefined);
    if (!value || subjectIds.includes(value)) return;
    setSubjectIds((prev) => [...prev, value]);
  };

  useEffect(() => {
    void handleLoad(1);
  }, [handleLoad]);

  const removeSubject = (subjectId: string) => {
    setSubjectIds((prev) => prev.filter((id) => id !== subjectId));
  };

  return (
    <ReportPageShell
      title="Comparación de exámenes"
      description="Compara equilibrio y cobertura de preguntas por asignatura."
    >
      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="subject">Asignaturas</Label>
            <Select
              value={pendingSubjectId}
              onValueChange={(value) => addSubject(value)}
              disabled={lookupsLoading}
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="Agregar asignatura" />
              </SelectTrigger>
              <SelectContent>
                {availableSubjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2 flex flex-wrap gap-2">
              {subjectIds.map((id) => {
                const subject = subjects.find((item) => item.id === id);
                return (
                  <Badge key={id} variant="secondary" className="gap-1">
                    {subject?.name ?? id}
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => removeSubject(id)}
                    >
                      ×
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
          <div>
            <Label htmlFor="sortBy">Ordenar por</Label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as ExamComparisonSortByEnum)}>
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
          <div>
            <Label htmlFor="balance">Umbral de equilibrio</Label>
            <Input
              id="balance"
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={balanceThreshold}
              onChange={(event) => {
                const nextValue = Number(event.target.value);
                if (Number.isNaN(nextValue)) {
                  setBalanceThreshold(0);
                  return;
                }
                setBalanceThreshold(Math.min(1, Math.max(0, nextValue)));
              }}
            />
            <p className="text-xs text-muted-foreground">Valor entre 0 y 1.</p>
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
          <p className="text-sm text-muted-foreground">Cargando comparación...</p>
        ) : !hasLoadedResults ? (
          <p className="text-sm text-muted-foreground">Aún no se han consultado resultados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-2 py-2">Examen</th>
                  <th className="px-2 py-2">Asignatura</th>
                  <th className="px-2 py-2">Equilibrado</th>
                  <th className="px-2 py-2">Brecha</th>
                  <th className="px-2 py-2">Distribución</th>
                  <th className="px-2 py-2">Temas</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.examId} className="border-t">
                    <td className="px-2 py-3 font-medium text-foreground">{row.title}</td>
                    <td className="px-2 py-3">{row.subjectName ?? row.subjectId}</td>
                    <td className="px-2 py-3">{row.balanced ? "Sí" : "No"}</td>
                    <td className="px-2 py-3">{row.balanceGap.toFixed(2)}</td>
                    <td className="px-2 py-3 max-w-[18rem] break-words whitespace-normal">
                      {Object.entries(row.difficultyDistribution)
                        .map(([key, value]) => `${key}: ${(value * 100).toFixed(0)}%`)
                        .join(", ")}
                    </td>
                    <td className="px-2 py-3 max-w-[20rem] break-words whitespace-normal">
                      {row.topicDistribution
                        .map((topic) => `${topic.topicName ?? "Sin tema"}: ${topic.questionCount}`)
                        .join(", ")}
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
