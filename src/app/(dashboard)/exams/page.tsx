"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Calendar, BookOpen, GraduationCap, Filter, Search } from "lucide-react"
import { StudentExamFiltersDialog } from "@/components/dashboard/exams/exam-filters-dialog"
import { ExamTakingView } from "@/components/dashboard/exams/exam-taking-view"
import { useStudentExams } from "@/hooks/exam-application/use-student-exams"
import { AssignedExamStatus, ExamAssignment } from "@/types/exam-application/exam"
import { StudentExamFilters } from "@/types/exam-application/filters"

const getEstadoBadge = (estado: AssignedExamStatus) => {
  switch (estado) {
    case AssignedExamStatus.PENDING:
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">Pendiente</Badge>
    case AssignedExamStatus.ENABLED:
      return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Activo</Badge>
    case AssignedExamStatus.IN_EVALUATION:
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">En evaluación</Badge>
    case AssignedExamStatus.GRADED:
      return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">Calificada</Badge>
    default:
      return <Badge variant="outline">{estado}</Badge>
  }
}

const formatApplicationDateTime = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

export default function PruebasView() {
  const { exams, loading, filters, setFilters, refresh, search, setSearch } = useStudentExams()
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [selectedExamAssignment, setSelectedExamAssignment] = useState<ExamAssignment | null>(null)

  // Filtros temporales que no se aplican hasta presionar "Aplicar"
  const [tempFilters, setTempFilters] = useState<StudentExamFilters>(filters)

  // Extraer listas únicas para filtros (esto es temporal, idealmente vendría del backend)
  const asignaturas = useMemo(() => {
    const unique = new Map<string, string>();
    exams.forEach(e => unique.set(e.subjectId, e.subjectName));
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
  }, [exams])

  const profesores = useMemo(() => {
    const unique = new Map<string, string>();
    exams.forEach(e => unique.set(e.teacherId, e.teacherName));
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
  }, [exams])

  const handleApplyFilters = () => {
    setFilters(tempFilters)
    setShowFiltersDialog(false)
  }

  const handleExamClick = (exam: ExamAssignment) => {
    if (exam.status === AssignedExamStatus.ENABLED) {
      setSelectedExamAssignment(exam)
    }
  }

  const handleBackFromExam = () => {
    setSelectedExamAssignment(null)
    refresh() // Refresh list to update status if changed
  }

  const activeFiltersCount = Object.values(filters).filter(
    value => value !== "ALL"
  ).length

  // Si hay un examen activo seleccionado, mostrar la vista del examen
  if (selectedExamAssignment) {
    return <ExamTakingView assignment={selectedExamAssignment} onBack={handleBackFromExam} />
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 sm:p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold mb-1">Mis Exámenes</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona y revisa todas tus pruebas asignadas
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre de examen..."
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

      <div className="flex-1 overflow-hidden p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Cargando exámenes...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-base sm:text-lg font-medium mb-2">No se encontraron exámenes</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {search || filters.status !== "ALL" || filters.subjectId !== "ALL" || filters.teacherId !== "ALL"
                ? "Intenta con otros términos de búsqueda o ajusta los filtros"
                : "No hay exámenes asignados"}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4">
              {exams.map((exam) => (
                <Card
                  key={exam.id}
                  className="p-5 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">{exam.title ?? exam.examTitle ?? `Examen de ${exam.subjectName}`}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {exam.subjectName}
                              </Badge>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{exam.teacherName}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {exam.status === AssignedExamStatus.GRADED && exam.grade !== null && (
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground mb-0.5">Calificación</div>
                            <div className="text-xl font-mono text-green-600">{exam.grade}</div>
                          </div>
                        )}
                        {getEstadoBadge(exam.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>{formatApplicationDateTime(exam.applicationDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span>{exam.durationMinutes} minutos</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GraduationCap className="h-4 w-4 flex-shrink-0" />
                        <span>{exam.teacherName}</span>
                      </div>
                    </div>

                    {exam.status === AssignedExamStatus.ENABLED && (
                      <div className="pt-3 border-t">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleExamClick(exam)
                          }}
                          className="w-full sm:w-auto"
                        >
                          Realizar Examen
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <StudentExamFiltersDialog
        open={showFiltersDialog}
        onOpenChange={setShowFiltersDialog}
        filters={tempFilters}
        onFiltersChange={setTempFilters}
        asignaturas={asignaturas}
        profesores={profesores}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  )
}
