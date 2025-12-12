"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Search } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

import { ExamApplicationService, AssignExamToCoursePayload } from "@/services/exam-application/exam-application-service"
import { fetchStudents } from "@/services/users/student"
import { fetchCurrentUser } from "@/services/users/users"
import type { StudentUser } from "@/types/users/student"
import { showSuccessToast } from "@/utils/toast"

interface ExamAssignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  examId: string
  examTitle?: string
  onAssigned?: () => void
}

const getDefaultDateTimeLocal = () => {
  const now = new Date()
  now.setSeconds(0, 0)
  return now.toISOString().slice(0, 16)
}

export function ExamAssignDialog({
  open,
  onOpenChange,
  examId,
  examTitle,
  onAssigned,
}: ExamAssignDialogProps) {
  const [students, setStudents] = useState<StudentUser[]>([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [studentsError, setStudentsError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [applicationDate, setApplicationDate] = useState(getDefaultDateTimeLocal())
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [submitting, setSubmitting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [userError, setUserError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [courseFilter, setCourseFilter] = useState("all")

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setStudentsLoading(true)
    setStudents([])
    setStudentsError(null)
    void fetchStudents({ limit: 100, offset: 0 })
      .then(({ data }) => {
        if (cancelled) return
        setStudents(data)
      })
      .catch((err) => {
        if (cancelled) return
        setStudentsError(err instanceof Error ? err.message : "No se pudieron cargar los estudiantes")
      })
      .finally(() => {
        if (cancelled) return
        setStudentsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setUserError(null)
    setCurrentUserId(null)
    void fetchCurrentUser()
      .then((user) => {
        if (cancelled) return
        setCurrentUserId(user.id)
      })
      .catch((err) => {
        if (cancelled) return
        setUserError(err instanceof Error ? err.message : "No se pudo obtener el usuario actual")
      })
    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (open) {
      setApplicationDate(getDefaultDateTimeLocal())
      setDurationMinutes(60)
      setFormError(null)
    } else {
      setSearchTerm("")
      setSelectedStudentIds([])
      setCourseFilter("all")
    }
  }, [open])

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return students.filter((student) => {
      if (courseFilter !== "all" && String(student.course) !== courseFilter) {
        return false
      }
      if (!term) return true
      const normalizedEmail = student.email?.toLowerCase() ?? ""
      const normalizedName = student.name?.toLowerCase() ?? ""
      return (
        normalizedName.includes(term) ||
        normalizedEmail.includes(term) ||
        String(student.course).includes(term)
      )
    })
  }, [students, searchTerm, courseFilter])


  const handleSelectToggle = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    )
  }

  const handleSelectAllVisible = () => {
    if (!filteredStudents.length) return
    const allVisibleSelected = filteredStudents.every((student) =>
      selectedStudentIds.includes(student.id),
    )
    if (allVisibleSelected) {
      setSelectedStudentIds((prev) =>
        prev.filter((id) => !filteredStudents.some((student) => student.id === id)),
      )
      return
    }
    setSelectedStudentIds((prev) => {
      const next = new Set(prev)
      filteredStudents.forEach((student) => next.add(student.id))
      return Array.from(next)
    })
  }

  const handleSubmit = async () => {
    setFormError(null)
    if (!currentUserId) {
      setFormError("No se pudo identificar al usuario actual.")
      return
    }
    if (!selectedStudentIds.length) {
      setFormError("Selecciona al menos un estudiante.")
      return
    }
    if (!applicationDate) {
      setFormError("Indica la fecha de aplicación.")
      return
    }
    if (durationMinutes < 1) {
      setFormError("La duración debe ser al menos 1 minuto.")
      return
    }

    const payload: AssignExamToCoursePayload = {
      examId,
      studentIds: selectedStudentIds,
      applicationDate: new Date(applicationDate).toISOString(),
      durationMinutes,
      currentUserId,
    }

    setSubmitting(true)
    try {
      await ExamApplicationService.assignExamToCourse(examId, payload)
      showSuccessToast("Examen asignado", "Los estudiantes seleccionados recibirán la notificación.")
      onAssigned?.()
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Asignar examen</DialogTitle>
          <DialogDescription>
            {examTitle ? (
              <>
                Este examen se va a aplicar para &ldquo;{examTitle}&rdquo;. Elige fecha, duración y estudiantes.
              </>
            ) : (
              "Define cuándo y a quiénes asignar este examen aprobado."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {(studentsError || userError) && (
            <p className="text-sm text-destructive">
              {studentsError ?? userError}
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="exam-application-date">Fecha de aplicación</Label>
              <Input
                id="exam-application-date"
                type="datetime-local"
                value={applicationDate}
                onChange={(event) => setApplicationDate(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="exam-duration">Duración (min)</Label>
              <Input
                id="exam-duration"
                type="number"
                min={1}
                max={480}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(Number(event.target.value))}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">Estudiantes ({selectedStudentIds.length} seleccionados)</p>
                <p className="text-xs text-muted-foreground">Puedes buscar por nombre, email o curso.</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSelectAllVisible}>
                Seleccionar todos
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar estudiante..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>

            </div>
            <ScrollArea className="max-h-[50vh] border rounded-lg bg-background overflow-y-auto">
              <div className="p-2 space-y-2">
                {studentsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Cargando estudiantes...</span>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-2 py-4 text-center">
                    No se encontraron estudiantes para los filtros actuales.
                  </p>
                ) : (
                  filteredStudents.map((student) => {
                    const isSelected = selectedStudentIds.includes(student.id)
                    return (
                      <label
                        key={student.id}
                        htmlFor={`student-${student.id}`}
                        className="flex items-start gap-3 border rounded-lg p-3 hover:bg-muted/70 cursor-pointer"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSelectToggle(student.id)}
                          id={`student-${student.id}`}
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Curso {student.course}
                          </p>
                        </div>
                      </label>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {formError && (
            <p className="text-sm text-destructive">
              {formError}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || studentsLoading}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Asignando...
              </>
            ) : (
              "Asignar examen"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
