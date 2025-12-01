"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, FileCheck, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExamApprovalCard } from "@/components/dashboard/pending-exams/exam-approval-card";
import { ExamDetailDialog } from "@/components/dashboard/pending-exams/exam-detail-dialog";
import { ExamFiltersSheet } from "@/components/dashboard/pending-exams/exam-filters-sheet";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/utils/toast";
import { usePendingExams, ALL_PENDING_EXAMS_FILTER } from "@/hooks/exams/use-pending-exams";
import type { PendingExamDetail, PendingExamFilters, PendingExamListItem } from "@/types/pending-exams/exam";

export default function PendingExamsPage() {
  const {
    exams,
    loading,
    filters,
    search,
    setSearch,
    setFilters,
    professorOptions,
    subjectOptions,
    getExamDetail,
    getExamQuestionsWithDetails,
    approveExam,
    rejectExam,
  } = usePendingExams();

  const [showFiltersDialog, setShowFiltersDialog] = useState(false);
  const [tempFilters, setTempFilters] = useState<PendingExamFilters>(filters);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<PendingExamDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const resolvedQuestions = useMemo(
    () => getExamQuestionsWithDetails(selectedExam),
    [getExamQuestionsWithDetails, selectedExam],
  );

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const activeFiltersCount = useMemo(
    () => Object.values(filters).filter((value) => value !== ALL_PENDING_EXAMS_FILTER).length,
    [filters],
  );

  const handleExamClick = useCallback(
    async (exam: PendingExamListItem) => {
      setDetailDialogOpen(true);
      setDetailLoading(true);
      setSelectedExam(null);
      try {
        const detail = await getExamDetail(exam.id);
        setSelectedExam(detail);
      } catch (err) {
        const message = err instanceof Error ? err.message : "No fue posible cargar el examen";
        showError("No se pudo cargar el examen", message);
        setDetailDialogOpen(false);
      } finally {
        setDetailLoading(false);
      }
    },
    [getExamDetail],
  );

  const handleApproveExam = useCallback(
    async (examId: string, comment?: string) => {
      try {
    const updated = await approveExam(examId, { comment });
        setSelectedExam(updated);
        showSuccess("Examen aprobado", "Se notificó al profesor.");
      } catch (err) {
        const message = err instanceof Error ? err.message : undefined;
        showError("No se pudo aprobar el examen", message);
        throw err;
      }
    },
    [approveExam],
  );

  const handleRejectExam = useCallback(
    async (examId: string, comment?: string) => {
      try {
    const updated = await rejectExam(examId, { comment });
        setSelectedExam(updated);
        showSuccess("Examen rechazado", "El profesor recibirá tus comentarios.");
      } catch (err) {
        const message = err instanceof Error ? err.message : undefined;
        showError("No se pudo rechazar el examen", message);
        throw err;
      }
    },
    [rejectExam],
  );

  const handleDetailDialogChange = (open: boolean) => {
    setDetailDialogOpen(open);
    if (!open) {
      setSelectedExam(null);
      setDetailLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setShowFiltersDialog(false);
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <FileCheck className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-4" />
      <h3 className="text-base sm:text-lg font-medium mb-2">No se encontraron exámenes</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {search || activeFiltersCount > 0
          ? "Intenta con otros términos de búsqueda o ajusta los filtros"
          : "No hay exámenes disponibles"}
      </p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 sm:p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold mb-1">Pruebas a Aprobar</h1>
            <p className="text-sm text-muted-foreground">Revisa y gestiona las solicitudes de aprobación de exámenes</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por asignatura, examen o profesor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFiltersDialog(true)} className="w-full sm:w-auto relative">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4 sm:p-6">
        {loading && exams.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Cargando exámenes...
          </div>
        ) : exams.length === 0 ? (
          renderEmptyState()
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-3 pr-4">
              {exams.map((exam) => (
                <ExamApprovalCard key={exam.id} exam={exam} onClick={handleExamClick} />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <ExamFiltersSheet
        open={showFiltersDialog}
        onOpenChange={setShowFiltersDialog}
        filters={tempFilters}
        onFiltersChange={setTempFilters}
        professors={professorOptions}
        subjects={subjectOptions}
        onApplyFilters={handleApplyFilters}
      />

      <ExamDetailDialog
        open={detailDialogOpen}
        onOpenChange={handleDetailDialogChange}
        exam={selectedExam}
        loading={detailLoading}
        questions={resolvedQuestions}
        onApprove={handleApproveExam}
        onReject={handleRejectExam}
      />
    </div>
  );
}
