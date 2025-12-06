"use client"

import { useCallback, useMemo, useState } from "react"
import { Search, ClipboardList, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { RevisionCard, RevisionItem } from "@/components/dashboard/regrade/revision-card"
import {
  RevisionFiltersDialog,
  RevisionFilters,
  RevisionFilterOption
} from "@/components/dashboard/regrade/revision-filters-dialog"
import { RevisionGradingView } from "@/components/dashboard/regrade/revision-grading-view"
import { useRegradeQueues } from "@/hooks/exam-application/use-regrade-queues"
import { AssignedExamStatus } from "@/types/exam-application/exam"
import { PendingRegradeRequestStatus } from "@/types/exam-application/evaluation"

const DEFAULT_FILTERS: RevisionFilters = {
  studentId: "ALL",
  subjectId: "ALL",
  status: "ALL",
  kind: "ALL",
}

const STATUS_LABELS: Record<string, string> = {
  ALL: "Todos",
  [AssignedExamStatus.IN_EVALUATION]: "Por calificar",
  [PendingRegradeRequestStatus.REQUESTED]: "Solicitado",
  [PendingRegradeRequestStatus.IN_REVIEW]: "En revisión",
  [PendingRegradeRequestStatus.APPROVED]: "Aprobada",
  [PendingRegradeRequestStatus.REJECTED]: "Rechazada",
  [AssignedExamStatus.GRADED]: "Calificada",
}

const mapStatusLabel = (status: string) => STATUS_LABELS[status] ?? status

export default function RevisionesView() {
  const { assignments, regradeRequests, loading, error, search, setSearch, refresh } = useRegradeQueues()
  const [filters, setFilters] = useState<RevisionFilters>(DEFAULT_FILTERS)
  const [tempFilters, setTempFilters] = useState<RevisionFilters>(DEFAULT_FILTERS)
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [selectedRevision, setSelectedRevision] = useState<RevisionItem | null>(null)

  const assignmentItems: RevisionItem[] = useMemo(() => (
    assignments.map((assignment) => ({
      id: assignment.id,
      assignmentId: assignment.id,
      examId: assignment.examId,
      examTitle: assignment.examTitle ?? "Examen asignado",
      subjectId: assignment.subjectId,
      subjectName: assignment.subjectName ?? "Sin asignatura",
      studentId: assignment.studentId,
      studentName: assignment.studentName,
      status: assignment.status ?? AssignedExamStatus.IN_EVALUATION,
      grade: assignment.grade ?? null,
      createdAt: assignment.applicationDate,
      kind: "GRADE" as const,
    }))
  ), [assignments])

  const regradeItems: RevisionItem[] = useMemo(() => (
    regradeRequests.map((request) => ({
      id: request.id,
      assignmentId: request.examAssignmentId,
      examId: request.examId,
      examTitle: request.examTitle ?? "Revisión de examen",
      subjectId: request.subjectId,
      subjectName: request.subjectName,
      studentId: request.studentId,
      studentName: request.studentName,
      status: request.status,
      grade: request.grade ?? null,
      createdAt: request.createdAt,
      requestReason: request.reason,
      kind: "REGRADE" as const,
    }))
  ), [regradeRequests])

  const allItems = useMemo(() => [...assignmentItems, ...regradeItems], [assignmentItems, regradeItems])

  const filterItem = useCallback((item: RevisionItem) => {
    const text = search.trim().toLowerCase()
    const matchesSearch = !text
      || item.examTitle.toLowerCase().includes(text)
      || item.studentName.toLowerCase().includes(text)
      || item.subjectName.toLowerCase().includes(text)

    const matchesStudent = filters.studentId === "ALL"
      || item.studentId === filters.studentId
      || item.studentName === filters.studentId

    const matchesSubject = filters.subjectId === "ALL"
      || item.subjectId === filters.subjectId
      || item.subjectName === filters.subjectId

    const matchesStatus = filters.status === "ALL" || item.status === filters.status
    const matchesKind = filters.kind === "ALL" || item.kind === filters.kind

    return matchesSearch && matchesStudent && matchesSubject && matchesStatus && matchesKind
  }, [filters, search])

  const filteredAssignments = useMemo(
    () => assignmentItems.filter(filterItem),
    [assignmentItems, filterItem]
  )
  const filteredRegrades = useMemo(
    () => regradeItems.filter(filterItem),
    [regradeItems, filterItem]
  )

  const buildOptions = (
    items: RevisionItem[],
    key: "studentId" | "subjectId",
    labelKey: "studentName" | "subjectName"
  ): RevisionFilterOption[] => {
    const map = new Map<string, string>()
    items.forEach((item) => {
      const value = item[key]
      const label = item[labelKey]
      if (!label) return
      const optionValue = value ?? label
      map.set(optionValue, label)
    })
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
  }

  const studentOptions: RevisionFilterOption[] = useMemo(() => [
    { value: "ALL", label: "Todos" },
    ...buildOptions(allItems, "studentId", "studentName")
  ], [allItems])

  const subjectOptions: RevisionFilterOption[] = useMemo(() => [
    { value: "ALL", label: "Todas" },
    ...buildOptions(allItems, "subjectId", "subjectName")
  ], [allItems])

  const statusOptions: RevisionFilterOption[] = useMemo(() => {
    const statuses = new Set<string>([
      AssignedExamStatus.IN_EVALUATION,
      PendingRegradeRequestStatus.REQUESTED,
      PendingRegradeRequestStatus.IN_REVIEW,
      PendingRegradeRequestStatus.APPROVED,
      PendingRegradeRequestStatus.REJECTED,
      AssignedExamStatus.GRADED
    ])
    allItems.forEach((item) => statuses.add(item.status))
    return [
      { value: "ALL", label: "Todos" },
      ...Array.from(statuses).map((status) => ({
        value: status,
        label: mapStatusLabel(status)
      }))
    ]
  }, [allItems])

  const typeOptions: RevisionFilterOption[] = [
    { value: "ALL", label: "Todos" },
    { value: "GRADE", label: "Por calificar" },
    { value: "REGRADE", label: "Recalificaciones" },
  ]

  const activeFiltersCount = useMemo(
    () => Object.values(filters).filter((value) => value !== "ALL").length,
    [filters]
  )

  const handleApplyFilters = () => {
    setFilters(tempFilters)
    setShowFiltersDialog(false)
  }

  const handleRevisionClick = (revision: RevisionItem) => {
    if (!revision.assignmentId || !revision.examId) return
    setSelectedRevision(revision)
  }

  const handleBackFromGrading = () => {
    setSelectedRevision(null)
    refresh()
  }

  if (selectedRevision) {
    return (
      <RevisionGradingView
        revision={selectedRevision}
        onBack={handleBackFromGrading}
        onFinished={refresh}
      />
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 sm:p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold mb-1">Revisiones</h1>
            <p className="text-sm text-muted-foreground">
              Califica exámenes pendientes y gestiona solicitudes de recalificación
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por alumno, asignatura o examen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setTempFilters(filters)
              setShowFiltersDialog(true)
            }}
            className="w-full sm:w-auto relative"
          >
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

      <div className="flex-1 overflow-hidden p-4 sm:p-6 space-y-8">
        {error && (
          <div className="text-destructive text-sm">
            Ocurrió un error al cargar las revisiones. Intenta recargar o vuelve a intentarlo más tarde.
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Cargando revisiones...</p>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Exámenes a calificar</h2>
                <Badge variant="secondary">{filteredAssignments.length}</Badge>
              </div>
              {filteredAssignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
                  <ClipboardList className="h-10 w-10 mb-3 opacity-60" />
                  <p>No hay exámenes pendientes de calificación</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[420px]">
                  <div className="space-y-3 pr-4">
                    {filteredAssignments.map((revision) => (
                      <RevisionCard
                        key={revision.id}
                        revision={revision}
                        onClick={handleRevisionClick}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Solicitudes de recalificación</h2>
                <Badge variant="secondary">{filteredRegrades.length}</Badge>
              </div>
              {filteredRegrades.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
                  <ClipboardList className="h-10 w-10 mb-3 opacity-60" />
                  <p>No hay solicitudes pendientes</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[420px]">
                  <div className="space-y-3 pr-4">
                    {filteredRegrades.map((revision) => (
                      <RevisionCard
                        key={revision.id}
                        revision={revision}
                        onClick={handleRevisionClick}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </>
        )}
      </div>

      <RevisionFiltersDialog
        open={showFiltersDialog}
        onOpenChange={setShowFiltersDialog}
        filters={tempFilters}
        onFiltersChange={setTempFilters}
        studentOptions={studentOptions}
        subjectOptions={subjectOptions}
        statusOptions={statusOptions}
        typeOptions={typeOptions}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  )
}
