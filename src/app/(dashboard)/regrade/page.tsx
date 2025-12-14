"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Search, ClipboardList, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
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
import { fetchCurrentUser, fetchTeacherDetail, fetchStudents, fetchTeacherByUserId } from "@/services/users/users"
import { fetchSubjectDetail } from "@/services/question-administration/subjects"

const DEFAULT_FILTERS: RevisionFilters = {
  studentId: "ALL",
  subjectId: "ALL",
}

interface RevisionListPaginationProps {
  currentCount: number
  total?: number | null
  page: number
  pageSize: number
  loading: boolean
  onPageChange: (page: number) => void
  entityLabel?: string
}

function RevisionListPagination({
  currentCount,
  total,
  page,
  pageSize,
  loading,
  onPageChange,
  entityLabel = "elementos",
}: RevisionListPaginationProps) {
  const safePageSize = pageSize > 0 ? pageSize : 1
  const displayTotal = typeof total === "number" ? total : currentCount
  const totalPages = Math.max(1, Math.ceil((displayTotal || 1) / safePageSize))
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <div className="mt-4 pt-4 border-t flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Mostrando {currentCount} de {displayTotal} {entityLabel}.
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={loading || !canPrev}
        >
          Anterior
        </Button>
        <span className="text-sm">
          Página {page} de {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={loading || !canNext}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}

export default function RevisionesView() {
  const {
    assignments,
    regradeRequests,
    assignmentsLoading,
    regradeLoading,
    assignmentsError,
    regradeError,
    assignmentSearch,
    regradeSearch,
    setAssignmentSearch,
    setRegradeSearch,
    refresh,
    studentNames,
    examTitles,
    assignmentsPage,
    assignmentsLimit,
    assignmentsTotal,
    regradePage,
    regradeLimit,
    regradeTotal,
    setAssignmentsPage,
    setRegradePage,
    assignmentFilters,
    regradeFilters,
    setAssignmentFilters,
    setRegradeFilters,
  } = useRegradeQueues()
  const [activeTab, setActiveTab] = useState<"GRADE" | "REGRADE">("GRADE")
  const [tempFilters, setTempFilters] = useState<RevisionFilters>(DEFAULT_FILTERS)
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(null)
  const [subjectOptions, setSubjectOptions] = useState<RevisionFilterOption[]>([{ value: "ALL", label: "Todas" }])
  const [studentOptions, setStudentOptions] = useState<RevisionFilterOption[]>([{ value: "ALL", label: "Todos" }])

  const activeFilters = useMemo(
    () => activeTab === "GRADE" ? assignmentFilters : regradeFilters,
    [activeTab, assignmentFilters, regradeFilters]
  )

  useEffect(() => {
    setTempFilters(activeFilters)
  }, [activeFilters, activeTab])

  useEffect(() => {
    let cancelled = false
    const loadSubjects = async () => {
      try {
        const currentUser = await fetchCurrentUser()
        if (cancelled) return
        if (currentUser.role !== "teacher") {
          setSubjectOptions([{ value: "ALL", label: "Todas" }])
          return
        }

        const teacher =
          await fetchTeacherByUserId(currentUser.id) ??
          null

        if (!teacher) {
          setSubjectOptions([{ value: "ALL", label: "Todas" }])
          return
        }

        let subjectIds = Array.from(new Set([
          ...(teacher.subjects_ids ?? []),
          ...(teacher.teaching_subjects_ids ?? []),
        ]))

        if (!subjectIds.length) {
          try {
            const teacherDetail = await fetchTeacherDetail(teacher.id)
            subjectIds = Array.from(new Set([
              ...(teacherDetail.subjects_ids ?? []),
              ...(teacherDetail.teaching_subjects_ids ?? []),
            ]))
          } catch (err) {
            console.error("No se pudo cargar el detalle del profesor", err)
          }
        }

        if (!subjectIds.length) {
          setSubjectOptions([{ value: "ALL", label: "Todas" }])
          return
        }

        const subjects = await Promise.all(
          subjectIds.map(async (subjectId) => {
            try {
              return await fetchSubjectDetail(subjectId)
            } catch (err) {
              console.error("No se pudo cargar la asignatura", err)
              return null
            }
          })
        )

        if (cancelled) return

        const options = subjects
          .filter((subject): subject is NonNullable<typeof subject> => Boolean(subject))
          .map((subject) => ({
            value: subject.subject_id,
            label: subject.subject_name,
          }))

        const uniqueOptions = Array.from(
          new Map(options.map((option) => [option.value, option.label])).entries()
        ).map(([value, label]) => ({ value, label }))

        setSubjectOptions([{ value: "ALL", label: "Todas" }, ...uniqueOptions])
      } catch (err) {
        console.error("No se pudieron cargar las asignaturas", err)
        if (!cancelled) {
          setSubjectOptions([{ value: "ALL", label: "Todas" }])
        }
      }
    }

    void loadSubjects()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadStudents = async () => {
      try {
        const pageSize = 50
        let offset = 0
        let total = Number.POSITIVE_INFINITY
        const collected: RevisionFilterOption[] = []

        while (offset < total) {
          const { data, meta } = await fetchStudents({ limit: pageSize, offset })
          if (cancelled) return

          collected.push(
            ...data.map((student) => ({
              value: student.id,
              label: student.name ?? student.id,
            }))
          )

          if (!meta || typeof meta.total !== "number" || typeof meta.limit !== "number") {
            break
          }
          total = meta.total
          const nextOffset = meta.offset + meta.limit
          if (meta.limit <= 0 || nextOffset === offset) {
            break
          }
          offset = nextOffset
        }

        if (cancelled) return

        const uniqueOptions = Array.from(
          new Map(collected.map((option) => [option.value, option.label])).entries()
        ).map(([value, label]) => ({ value, label }))

        setStudentOptions([{ value: "ALL", label: "Todos" }, ...uniqueOptions])
      } catch (err) {
        console.error("No se pudieron cargar los alumnos", err)
        if (!cancelled) {
          setStudentOptions([{ value: "ALL", label: "Todos" }])
        }
      }
    }

    void loadStudents()

    return () => {
      cancelled = true
    }
  }, [])

  const resolveStudentName = useCallback(
    (studentId?: string, fallback?: string) => {
      if (!studentId) {
        return fallback ?? "Estudiante desconocido"
      }
      return studentNames[studentId] ?? fallback ?? "Estudiante desconocido"
    },
    [studentNames]
  )

  const resolveExamTitle = useCallback(
    (examId?: string, fallback?: string, defaultLabel?: string) => {
      if (examId && examTitles[examId]) {
        return examTitles[examId]
      }
      if (fallback) {
        return fallback
      }
      return defaultLabel ?? "Examen"
    },
    [examTitles]
  )

  const assignmentItems: RevisionItem[] = useMemo(() => (
    assignments.map((assignment) => ({
      id: assignment.id,
      assignmentId: assignment.id,
      examId: assignment.examId,
      examTitle: resolveExamTitle(assignment.examId, assignment.examTitle, "Examen asignado"),
      subjectId: assignment.subjectId,
      subjectName: assignment.subjectName ?? "Sin asignatura",
      studentId: assignment.studentId,
      studentName: resolveStudentName(assignment.studentId, assignment.studentName),
      status: assignment.status ?? AssignedExamStatus.IN_EVALUATION,
      grade: assignment.grade ?? null,
      createdAt: assignment.applicationDate,
      kind: "GRADE" as const,
    }))
  ), [assignments, resolveStudentName, resolveExamTitle])

  const regradeItems: RevisionItem[] = useMemo(() => (
    regradeRequests.map((request) => ({
      id: request.id,
      assignmentId: request.assignmentId ?? request.examAssignmentId,
      regradeRequestId: request.regradeId ?? request.id,
      examId: request.examId,
      examTitle: resolveExamTitle(request.examId, request.examTitle, "Revisión de examen"),
      subjectId: request.subjectId,
      subjectName: request.subjectName ?? "Sin asignatura",
      studentId: request.studentId,
      studentName: resolveStudentName(request.studentId, request.studentName),
      status: request.status,
      grade: request.grade ?? null,
      createdAt: request.createdAt ?? request.requestedAt,
      requestReason: request.reason,
      kind: "REGRADE" as const,
    }))
  ), [regradeRequests, resolveStudentName, resolveExamTitle])

  const allItems = useMemo(() => [...assignmentItems, ...regradeItems], [assignmentItems, regradeItems])
  const selectedRevision = useMemo(() => {
    if (!selectedRevisionId) {
      return null
    }
    return allItems.find((item) => item.id === selectedRevisionId) ?? null
  }, [allItems, selectedRevisionId])

  const assignmentPageSize = assignmentsLimit > 0 ? assignmentsLimit : 1
  const assignmentTotalItems = assignmentsTotal ?? assignmentItems.length
  const assignmentTotalPages = Math.max(1, Math.ceil((assignmentTotalItems || 1) / assignmentPageSize))

  const regradePageSize = regradeLimit > 0 ? regradeLimit : 1
  const regradeTotalItems = regradeTotal ?? regradeItems.length
  const regradeTotalPages = Math.max(1, Math.ceil((regradeTotalItems || 1) / regradePageSize))

  const changeAssignmentPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage === assignmentsPage || nextPage > assignmentTotalPages) return
    setAssignmentsPage(nextPage)
  }

  const changeRegradePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage === regradePage || nextPage > regradeTotalPages) return
    setRegradePage(nextPage)
  }

  const activeFiltersCount = useMemo(
    () => Object.values(activeFilters).filter((value) => value !== "ALL").length,
    [activeFilters]
  )

  const handleApplyFilters = () => {
    if (activeTab === "GRADE") {
      setAssignmentFilters(tempFilters)
    } else {
      setRegradeFilters(tempFilters)
    }
    setShowFiltersDialog(false)
  }

  const handleRevisionClick = (revision: RevisionItem) => {
    if (!revision.examId) return
    setSelectedRevisionId(revision.id)
  }

  const handleBackFromGrading = () => {
    setSelectedRevisionId(null)
    refresh()
  }

  const activeItems = activeTab === "GRADE" ? assignmentItems : regradeItems
  const activePage = activeTab === "GRADE" ? assignmentsPage : regradePage
  const activePageSize = activeTab === "GRADE" ? assignmentPageSize : regradePageSize
  const activeTotal = activeTab === "GRADE" ? assignmentsTotal : regradeTotal
  const changeActivePage = activeTab === "GRADE" ? changeAssignmentPage : changeRegradePage
  const activeLoading = activeTab === "GRADE" ? assignmentsLoading : regradeLoading
  const activeError = activeTab === "GRADE" ? assignmentsError : regradeError
  const activeSearch = activeTab === "GRADE" ? assignmentSearch : regradeSearch
  const handleSearchChange = (value: string) => {
    if (activeTab === "GRADE") {
      setAssignmentSearch(value)
    } else {
      setRegradeSearch(value)
    }
  }
  const isFiltering = useMemo(
    () => activeFiltersCount > 0 || Boolean(activeSearch.trim()),
    [activeFiltersCount, activeSearch]
  )

  const activeTitle = activeTab === "GRADE" ? "Exámenes a calificar" : "Solicitudes de recalificación"
  const activeEntityLabel = activeTab === "GRADE" ? "exámenes" : "solicitudes"
  const emptyLabel = activeTab === "GRADE"
    ? "No hay exámenes pendientes de calificación"
    : "No hay solicitudes pendientes"

  useEffect(() => {
    void refresh()
  }, [activeTab, refresh])

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
            <h1 className="text-xl sm:text-2xl font-semibold mb-1">Calificaciones</h1>
            <p className="text-sm text-muted-foreground">
              Califica exámenes pendientes y gestiona solicitudes de recalificación
            </p>
          </div>
          <div className="flex items-center gap-2">
            {["GRADE", "REGRADE"].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab as "GRADE" | "REGRADE")}
              >
                {tab === "GRADE" ? "Calificaciones" : "Recalificaciones"}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título de examen..."
              value={activeSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setTempFilters(activeFilters)
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
        {activeError && (
          <div className="text-destructive text-sm">
            Ocurrió un error al cargar {activeTab === "GRADE" ? "las calificaciones" : "las solicitudes de recalificación"}. Intenta recargar o vuelve a intentarlo más tarde.
          </div>
        )}
        {activeLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Cargando {activeTab === "GRADE" ? "calificaciones" : "recalificaciones"}...</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">{activeTitle}</h2>
              <Badge variant="secondary">{activeItems.length}</Badge>
            </div>
            {activeItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
                <ClipboardList className="h-10 w-10 mb-3 opacity-60" />
                <p>{isFiltering ? "No se encontraron resultados con la búsqueda o filtros seleccionados" : emptyLabel}</p>
              </div>
            ) : (
              <>
                <ScrollArea className="max-h-[420px]">
                  <div className="space-y-3 pr-4">
                    {activeItems.map((revision) => (
                      <RevisionCard
                        key={revision.id}
                        revision={revision}
                        onClick={handleRevisionClick}
                      />
                    ))}
                  </div>
                </ScrollArea>
                <RevisionListPagination
                  currentCount={activeItems.length}
                  total={activeTotal}
                  page={activePage}
                  pageSize={activePageSize}
                  loading={activeLoading}
                  onPageChange={changeActivePage}
                  entityLabel={activeEntityLabel}
                />
              </>
            )}
          </div>
        )}
      </div>

      <RevisionFiltersDialog
        open={showFiltersDialog}
        onOpenChange={setShowFiltersDialog}
        filters={tempFilters}
        onFiltersChange={setTempFilters}
        studentOptions={studentOptions}
        subjectOptions={subjectOptions}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  )
}
