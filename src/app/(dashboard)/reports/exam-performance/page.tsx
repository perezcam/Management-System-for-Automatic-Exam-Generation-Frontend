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
import { useAnalyticsLookups } from "@/hooks/analytics/use-analytics-lookups";
import { useExamPerformanceReport } from "@/hooks/analytics/use-exam-performance-report";
import { downloadExamPerformanceReportPdf } from "@/services/analytics/reports";

export default function ExamPerformanceReportPage() {
  const { exams, loading: lookupsLoading } = useAnalyticsLookups();
  const { report, loading, error, load } = useExamPerformanceReport();
  const [examId, setExamId] = useState<string>("");

  const overallSuccessText = useMemo(() => {
    if (!report) return "-";
    return `${(report.overallSuccessRate * 100).toFixed(1)}%`;
  }, [report]);

  const handleLoad = useCallback(async () => {
    if (!examId) return;
    await load({ examId });
  }, [examId, load]);

  const handleDownload = async () => {
    if (!examId) return;
    await downloadExamPerformanceReportPdf(examId);
  };

  useEffect(() => {
    void handleLoad();
  }, [handleLoad]);

  return (
    <ReportPageShell
      title="Desempeño por examen"
      description="Explora el éxito de los estudiantes pregunta por pregunta y los grupos de dificultad."
    >
      <Card className="p-6 space-y-4">
        <div>
          <Label htmlFor="exam">Examen</Label>
          <Select
            value={examId || undefined}
            onValueChange={(value) => setExamId(value)}
            disabled={lookupsLoading}
          >
            <SelectTrigger id="exam">
              <SelectValue placeholder="Selecciona un examen" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <Button variant="ghost" onClick={() => void handleDownload()} disabled={!examId || !report}>
            Descargar PDF
          </Button>
        </div>
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error.message}
          </div>
        )}
      </Card>

      {report && (
        <Card className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Éxito global</p>
              <p className="text-3xl font-semibold">{overallSuccessText}</p>
            </div>
            <div className="flex gap-3">
              {report.difficultyGroups.map((group) => (
                <div key={group.difficulty} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-semibold">{group.difficulty}</p>
                  <p className="text-muted-foreground">
                    {(group.successRate * 100).toFixed(1)} % · {group.questionCount} preguntas
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        {!loading && !report && (
          <p className="text-sm text-muted-foreground">Aún no se han consultado resultados.</p>
        )}
        {loading && <p className="text-sm text-muted-foreground">Cargando desempeño...</p>}
        {!loading && report && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-2 py-2">Índice</th>
                  <th className="px-2 py-2">Pregunta</th>
                  <th className="px-2 py-2">Dificultad</th>
                  <th className="px-2 py-2">Puntaje</th>
                  <th className="px-2 py-2">Éxito %</th>
                  <th className="px-2 py-2">Intentos</th>
                </tr>
              </thead>
              <tbody>
                {report.questions.map((row) => (
                <tr key={row.examQuestionId} className="border-t">
                  <td className="px-2 py-3 font-medium text-foreground">{row.questionIndex}</td>
                  <td className="px-2 py-3 max-w-[24rem] break-words whitespace-normal">{row.questionBody ?? row.questionId}</td>
                  <td className="px-2 py-3 max-w-[20rem] break-words whitespace-normal">
                    {row.difficulty.toLowerCase()} · {row.topicName ?? "Sin tema"}
                  </td>
                  <td className="px-2 py-3">{row.questionScore}</td>
                  <td className="px-2 py-3">{(row.successRate * 100).toFixed(1)}%</td>
                  <td className="px-2 py-3">{row.attempts}</td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </ReportPageShell>
  );
}
