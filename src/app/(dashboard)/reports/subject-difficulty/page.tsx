"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useAnalyticsLookups } from "@/hooks/analytics/use-analytics-lookups";
import { useSubjectDifficultyReport } from "@/hooks/analytics/use-subject-difficulty-report";
import { SubjectDifficultySortByEnum, SortDirectionEnum } from "@/types/analytics";
import { downloadSubjectDifficultyReportPdf } from "@/services/analytics/reports";

const PAGE_SIZE = 10;

const sortOrderOptions = [
  { value: SortDirectionEnum.ASC, label: "Ascendente" },
  { value: SortDirectionEnum.DESC, label: "Descendente" },
];

const formatDifficultyDetails = (details: { difficulty: string; averageGrade: number | null; examCount: number }[]) => (
  <div className="text-xs text-muted-foreground space-y-1">
    {details.map((detail) => (
      <p key={detail.difficulty}>
        {detail.difficulty}: {detail.averageGrade === null ? "N/A" : detail.averageGrade.toFixed(1)} · {detail.examCount} exámenes
      </p>
    ))}
  </div>
);

export default function SubjectDifficultyReportPage() {
  const { subjects, loading: lookupsLoading } = useAnalyticsLookups();
  const { report, loading, error, load } = useSubjectDifficultyReport();
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [pendingSubjectId, setPendingSubjectId] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<SortDirectionEnum>(SortDirectionEnum.ASC);
  const [page, setPage] = useState(1);

  const offset = (page - 1) * PAGE_SIZE;

  const isNextEnabled = useMemo(() => report?.subjectCorrelations.length === PAGE_SIZE, [report]);

  const handleLoad = useCallback(
    async (targetPage = 1) => {
      await load({
        subjectIds: subjectIds.length ? subjectIds : undefined,
        sortOrder,
        sortBy: SubjectDifficultySortByEnum.SUBJECT_NAME,
        limit: PAGE_SIZE,
        offset: (targetPage - 1) * PAGE_SIZE,
      });
      setPage(targetPage);
    },
    [load, sortOrder, subjectIds],
  );

  const handleDownload = async () => {
    await downloadSubjectDifficultyReportPdf({
      subjectIds: subjectIds.length ? subjectIds : undefined,
      sortBy: SubjectDifficultySortByEnum.SUBJECT_NAME,
      sortOrder,
      limit: PAGE_SIZE,
      offset,
    });
  };

  const availableSubjects = subjects.filter((subject) => !subjectIds.includes(subject.id));

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
      title="Correlación dificultad / rendimiento"
      description="Revisa cómo varía la dificultad y el promedio por asignatura, y detecta preguntas con más fallos."
    >
      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <Button variant="ghost" onClick={() => void handleDownload()} disabled={loading || !report}>
            Descargar PDF
          </Button>
        </div>
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error.message}
          </div>
        )}
      </Card>

      <Card className="p-6 space-y-6">
        {!report && !loading && (
          <p className="text-sm text-muted-foreground">Aún no se han consultado resultados.</p>
        )}
        {loading && <p className="text-sm text-muted-foreground">Cargando correlaciones...</p>}
        {report && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Asignaturas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-2 py-2">Asignatura</th>
                      <th className="px-2 py-2">Correlación</th>
                      <th className="px-2 py-2">Promedios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.subjectCorrelations.map((row, index) => (
                      <tr key={`${row.subjectId}-${index}`} className="border-t">
                        <td className="px-2 py-3 font-medium text-foreground max-w-[18rem] break-words whitespace-normal">
                          {row.subjectName ?? row.subjectId}
                        </td>
                        <td className="px-2 py-3">{row.correlationScore.toFixed(2)}</td>
                        <td className="px-2 py-3 max-w-[36rem] break-words whitespace-normal">
                          {formatDifficultyDetails(row.difficultyDetails)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Preguntas con más fallos</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-2 py-2">Pregunta</th>
                      <th className="px-2 py-2">Asignatura</th>
                      <th className="px-2 py-2">Autor</th>
                      <th className="px-2 py-2">Tasa de fallas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topFailingQuestions.map((row, index) => (
                      <tr
                        key={`${row.questionId}-${row.subjectId}-${row.authorId ?? "unknown"}-${index}`}
                        className="border-t"
                      >
                        <td className="px-2 py-3 max-w-[30rem] break-words whitespace-normal">
                          {row.questionBody ?? row.questionId}
                        </td>
                        <td className="px-2 py-3">{row.subjectName ?? "Sin asignatura"}</td>
                        <td className="px-2 py-3">{row.authorName ?? row.authorId ?? "-"}</td>
                        <td className="px-2 py-3">{(row.failureRate * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Comparación de solicitudes de recalificación</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-2 py-2">Asignatura</th>
                      <th className="px-2 py-2">Curso</th>
                      <th className="px-2 py-2">Promedio revaluación</th>
                      <th className="px-2 py-2">Promedio curso</th>
                      <th className="px-2 py-2">Solicitudes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.regradeComparison.map((row, index) => (
                      <tr key={`${row.subjectId}-${row.course}-${index}`} className="border-t">
                        <td className="px-2 py-3">{row.subjectName ?? row.subjectId}</td>
                        <td className="px-2 py-3">{row.course}</td>
                        <td className="px-2 py-3">{row.regradeAverage === null ? "N/A" : row.regradeAverage.toFixed(1)}</td>
                        <td className="px-2 py-3">{row.courseAverage === null ? "N/A" : row.courseAverage.toFixed(1)}</td>
                        <td className="px-2 py-3">{row.requests}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 justify-end">
          <Button variant="outline" disabled={loading || page <= 1} onClick={() => void handleLoad(page - 1)}>
            Anterior
          </Button>
          <Button variant="outline" disabled={loading || !isNextEnabled} onClick={() => void handleLoad(page + 1)}>
            Siguiente
          </Button>
        </div>
      </Card>
    </ReportPageShell>
  );
}
