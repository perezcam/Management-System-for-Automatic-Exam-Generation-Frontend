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
import { useAutomaticExamsReport } from "@/hooks/analytics/use-automatic-exams-report";
import { AutomaticExamSortByEnum, SortDirectionEnum } from "@/types/analytics";
import { downloadAutomaticExamsReportPdf } from "@/services/analytics/reports";

const PAGE_SIZE = 15;

const sortByOptions = [
  { value: AutomaticExamSortByEnum.CREATED_AT, label: "Fecha de creación" },
  { value: AutomaticExamSortByEnum.SUBJECT_NAME, label: "Asignatura" },
  { value: AutomaticExamSortByEnum.CREATOR_NAME, label: "Autor" },
];

const sortOrderOptions = [
  { value: SortDirectionEnum.ASC, label: "Ascendente" },
  { value: SortDirectionEnum.DESC, label: "Descendente" },
];

type AutomaticExamParameters = {
  questionCount?: number | null;
  topicCoverage?: {
    mode?: string | null;
    subjectId?: string | null;
    difficulty?: string | null;
    topicIds?: string[];
    questionIds?: string[];
  } | null;
  topicProportion?: Record<string, number> | null;
};

const formatParameters = (
  params: Record<string, unknown> | null,
  topicMap: Record<string, string>,
  topicSubtopicsMap: Record<string, string[]>,
) => {
  if (!params || Object.keys(params).length === 0) {
    return "Sin parámetros";
  }
  const typed = params as AutomaticExamParameters;
  type ParameterLine = { label: string; value: string };
  const entries: ParameterLine[] = [];

  if (typed.questionCount !== undefined && typed.questionCount !== null) {
    entries.push({ label: "Cantidad total de preguntas", value: `${typed.questionCount}` });
  }

  if (typed.topicCoverage) {
    const coverage = typed.topicCoverage;
    const topicList = coverage.topicIds;
    const coverageEntries = topicList?.length
      ? topicList.map((id) => {
          const topicName = topicMap[id] ?? id;
          const subtopics = topicSubtopicsMap[id] ?? [];
          const subtopicText = subtopics.length ? ` (${subtopics.join(", ")})` : "";
          return `${topicName}${subtopicText}`;
        })
      : [];
    const topicsDisplay = coverageEntries.length ? coverageEntries.join("; ") : "Sin temas";
    entries.push({ label: "Cobertura", value: topicsDisplay });
    if (coverage.difficulty) {
      entries.push({ label: "Dificultad", value: coverage.difficulty });
    }
  }

  if (typed.topicProportion && Object.keys(typed.topicProportion).length > 0) {
    const sorted = Object.entries(typed.topicProportion).sort(([, a], [, b]) => b - a);
    const proportionLines = sorted.map(([topicId, value]) => {
      const topicName = topicMap[topicId] ?? topicId;
      return `${topicName}: ${(value * 100).toFixed(1)}%`;
    });
    entries.push({ label: "Proporción por tipo", value: proportionLines.join("; ") });
  }

  if (entries.length === 0) {
    return "Sin parámetros";
  }

  return (
    <div className="text-xs text-muted-foreground space-y-1">
      {entries.map((entry) => (
        <p key={`${entry.label}-${entry.value}`} className="break-words whitespace-normal">
          <span className="font-semibold text-foreground">{entry.label}:</span>{" "}
          <span className="text-muted-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function AutomaticExamsReportPage() {
  const { subjects, loading: lookupsLoading, topicMap, topicSubtopicsMap } = useAnalyticsLookups();
  const { data, meta, loading, error, load } = useAutomaticExamsReport();
  const [subjectId, setSubjectId] = useState<string>("");
  const [sortBy, setSortBy] = useState<AutomaticExamSortByEnum>(AutomaticExamSortByEnum.CREATED_AT);
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
    await downloadAutomaticExamsReportPdf({
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
      title="Exámenes automáticos"
      description="Revisa qué exámenes se generaron automáticamente y los parámetros que usaron."
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
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as AutomaticExamSortByEnum)}>
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
                  <th className="px-2 py-2">Título</th>
                  <th className="px-2 py-2">Creador</th>
                  <th className="px-2 py-2">Asignatura</th>
                  <th className="px-2 py-2">Creado</th>
            <th className="px-2 py-2">Parámetros</th>
          </tr>
        </thead>
        <tbody>
        {data.map((row) => (
          <tr key={row.examId} className="border-t">
            <td className="px-2 py-3 font-medium text-foreground">{row.title}</td>
            <td className="px-2 py-3">{row.creatorName ?? row.creatorId}</td>
            <td className="px-2 py-3">{row.subjectName ?? row.subjectId}</td>
            <td className="px-2 py-3 text-muted-foreground">
              {new Date(row.createdAt).toLocaleString("es-PE", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </td>
            <td className="px-2 py-3 max-w-[28rem] break-words">
              {formatParameters(row.parameters, topicMap, topicSubtopicsMap)}
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
