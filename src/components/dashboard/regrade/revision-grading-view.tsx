"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { ScrollArea } from "../../ui/scroll-area"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Separator } from "../../ui/separator"
import {
  ArrowLeft,
  User,
  Calendar,
  BookOpen,
  CheckCircle2,
  FileText,
  Save,
  AlertCircle,
  Loader2
} from "lucide-react"
import { RevisionItem } from "./revision-card"
import { showError, showSuccess } from "../../../utils/toast"
import { useExamGrading } from "@/hooks/exam-application/use-exam-grading"
import { dispatchAssignmentGradedEvent } from "@/utils/events"
import type { ExamResponse } from "@/types/exam-application/exam"
import type { QuestionDetail } from "@/types/question-bank/question"

interface RevisionGradingViewProps {
  revision: RevisionItem
  onBack: () => void
  onFinished?: () => void
}

const formatDate = (value?: string) => {
  if (!value) return "Sin fecha"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

const getQuestionTypeLabel = (detail?: QuestionDetail | null) => {
  if (!detail) return "Pregunta"
  return detail.options && detail.options.length > 0 ? "Opción múltiple" : "Respuesta abierta"
}

const isManualQuestion = (detail?: QuestionDetail | null, response?: ExamResponse | null) => {
  if (detail) return !detail.options || detail.options.length === 0
  return !((response?.selectedOptions?.length ?? 0) > 0)
}

const getTextAnswer = (response?: ExamResponse | null) =>
  response?.textAnswer ?? response?.textResponse ?? ""

export function RevisionGradingView({ revision, onBack, onFinished }: RevisionGradingViewProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [manualScores, setManualScores] = useState<Record<string, number | null>>({})
  const [actionLoading, setActionLoading] = useState(false)
  const [savingManualResponseId, setSavingManualResponseId] = useState<string | null>(null)

  const {
    exam,
    responses,
    questionDetails,
    loading,
    loadingQuestionId,
    error,
    saving,
    refresh,
    loadQuestionAssets,
    setManualPoints,
    finalizeAssignment,
    questionError,
  } = useExamGrading(revision.assignmentId, revision.examId, revision.studentId)
  const isRecalification = revision.kind === "REGRADE"

  const questions = useMemo(() => exam?.questions ?? [], [exam])
  const selectedQuestion = questions.find((q) => q.questionId === selectedQuestionId) ?? null
  const selectedDetail = selectedQuestion ? questionDetails[selectedQuestion.questionId] ?? null : null
  const selectedResponse = selectedQuestion ? responses[selectedQuestion.questionId] ?? null : null
  const maxScore = selectedQuestion?.questionScore ?? 0
  const manualPointsAssigned = selectedResponse?.manualPoints ?? null
  const autoPointsAssigned = selectedResponse?.autoPoints ?? null
  const manualQuestionSelected = isManualQuestion(selectedDetail, selectedResponse)
  const manualGradePersisted = manualPointsAssigned !== null && manualPointsAssigned !== undefined
  const autoGradePersisted = autoPointsAssigned !== null && autoPointsAssigned !== undefined
  const questionHasPersistedGrade = selectedResponse
    ? manualGradePersisted || autoGradePersisted
    : false

  useEffect(() => {
    if (questions.length > 0 && !selectedQuestionId) {
      setSelectedQuestionId(questions[0].questionId)
    }
  }, [questions, selectedQuestionId])

  useEffect(() => {
    const question = selectedQuestion
    if (!question) return
    void loadQuestionAssets(question.questionId, question.questionIndex)
  }, [selectedQuestion, loadQuestionAssets])

  useEffect(() => {
    const next: Record<string, number | null> = {}
    Object.values(responses).forEach((resp) => {
      if (!resp) return
      next[resp.id] = resp.manualPoints ?? null
    })
    setManualScores(next)
  }, [responses])

  const getManualValue = useCallback((response?: ExamResponse | null) => {
    if (!response) return null
    const value = manualScores[response.id]
    return value === undefined ? response.manualPoints ?? null : value
  }, [manualScores])

  const isQuestionGraded = useCallback((questionId: string) => {
    const response = responses[questionId]
    if (!response) return false
    const detail = questionDetails[questionId]
    const manualValue = getManualValue(response)
    if (isManualQuestion(detail, response)) {
      return manualValue !== null && manualValue !== undefined
    }
    return response.autoPoints !== null && response.autoPoints !== undefined
  }, [getManualValue, questionDetails, responses])
  const selectedQuestionGraded = selectedQuestion ? isQuestionGraded(selectedQuestion.questionId) : false

  const progressByType = useMemo(() => {
    let manualGraded = 0
    let manualKnown = 0
    let autoGraded = 0
    let autoKnown = 0

    questions.forEach((question) => {
      const detail = questionDetails[question.questionId]
      const response = responses[question.questionId]
      if (!response) return

      if (isManualQuestion(detail, response)) {
        manualKnown += 1
        const manualValue = getManualValue(response)
        if (manualValue !== null && manualValue !== undefined) {
          manualGraded += 1
        }
      } else {
        autoKnown += 1
        if (response.autoPoints !== null && response.autoPoints !== undefined) {
          autoGraded += 1
        }
      }
    })

    return { manualGraded, manualKnown, autoGraded, autoKnown }
  }, [questions, questionDetails, responses, getManualValue])

  const {
    manualGraded: manualGradedCount,
    manualKnown: manualKnownCount,
    autoGraded: autoGradedCount,
    autoKnown: autoKnownCount,
  } = progressByType

  const gradedCount = useMemo(() => {
    if (!exam) return 0
    return exam.questions.reduce((count, question) => (
      isQuestionGraded(question.questionId) ? count + 1 : count
    ), 0)
  }, [exam, isQuestionGraded])

  const { earnedPoints, maxPoints } = useMemo(() => {
    if (!exam) return { earnedPoints: 0, maxPoints: 0 }
    let earned = 0
    let max = 0
    exam.questions.forEach((question) => {
      max += question.questionScore ?? 0
      const response = responses[question.questionId]
      const manualValue = getManualValue(response) ?? 0
      const autoValue = response?.autoPoints ?? 0
      earned += manualValue + autoValue
    })
    return { earnedPoints: earned, maxPoints: max }
  }, [exam, responses, getManualValue])

  const calculatedGrade = maxPoints > 0 ? (earnedPoints / maxPoints) * 10 : 0
  const allQuestionsGraded = (exam?.questions.length ?? 0) > 0 && gradedCount === (exam?.questions.length ?? 0)
  const manualValue = getManualValue(selectedResponse)
  const effectivePoints = manualPointsAssigned ?? autoPointsAssigned ?? null
  const autoPoints = autoPointsAssigned ?? 0
  const selectedTotalPoints = effectivePoints ?? ((manualValue ?? 0) + autoPoints)
  const showQuestionLoader = loadingQuestionId === selectedQuestion?.questionId && !selectedDetail
  const choiceOptions = useMemo(
    () => selectedDetail?.options ?? selectedResponse?.selectedOptions ?? [],
    [selectedDetail, selectedResponse]
  )
  const expectedOptions = selectedDetail?.options ?? []
  const hasManualValue = manualValue !== null && manualValue !== undefined
  const manualSaveLoading = selectedResponse ? savingManualResponseId === selectedResponse.id : false
  const manualEditable = manualQuestionSelected && (isRecalification || !questionHasPersistedGrade)
  const canSaveManualScore = manualEditable && Boolean(selectedResponse) && hasManualValue
  const hasPendingManualChange = canSaveManualScore && selectedResponse
    ? manualValue !== (selectedResponse.manualPoints ?? null)
    : false
  const manualSaveDisabled = !canSaveManualScore || !hasPendingManualChange || manualSaveLoading || saving

  const handleManualPointsChange = (value: string) => {
    if (!selectedResponse || !manualEditable) return
    const parsed = parseFloat(value)
    const normalized = Number.isNaN(parsed) ? null : Math.min(Math.max(parsed, 0), maxScore || parsed)
    setManualScores((prev) => ({
      ...prev,
      [selectedResponse.id]: normalized
    }))
  }

  const finishNotification = isRecalification ? "Recalificación completada" : "Calificación completada"
  const finalizeButtonLabel = isRecalification ? "Terminar recalificación" : "Terminar calificación"

  const handleFinalize = async () => {
    if (!exam) return
    setActionLoading(true)
    try {
      const pendingUpdates = exam.questions
        .map((q) => responses[q.questionId])
        .filter((resp): resp is ExamResponse => Boolean(resp))
        .filter((resp) => {
          const desired = getManualValue(resp)
          const current = resp.manualPoints ?? null
          return desired !== null && desired !== current
        })

      for (const resp of pendingUpdates) {
        const desired = getManualValue(resp)
        if (desired === null || desired === undefined) continue
        await setManualPoints(resp.id, desired)
      }

      await finalizeAssignment()
      if (revision.assignmentId) {
        dispatchAssignmentGradedEvent(revision.assignmentId)
      }
      showSuccess(finishNotification, `Nota final: ${calculatedGrade.toFixed(1)}/10`)
      if (onFinished) onFinished()
      onBack()
    } catch (err) {
      showError("No se pudo finalizar la calificación", err instanceof Error ? err.message : undefined)
    } finally {
      setActionLoading(false)
    }
  }
  const handleSaveManualScore = useCallback(async () => {
    if (!selectedResponse) {
      showError("Selecciona una respuesta para guardar la calificación")
      return
    }
    if (!manualEditable) {
      showError("Esta pregunta ya fue calificada y no puede modificarse")
      return
    }

    const desired = getManualValue(selectedResponse)
    if (desired === null || desired === undefined) {
      showError("Ingresa una puntuación válida antes de guardar")
      return
    }

    if (desired === (selectedResponse.manualPoints ?? null)) {
      showSuccess("La calificación ya está guardada")
      return
    }

    const responseId = selectedResponse.id
    setSavingManualResponseId(responseId)
    try {
      await setManualPoints(responseId, desired)
      showSuccess("Calificación guardada", "La puntuación manual se actualizó")
    } catch (err) {
      showError("No se pudo guardar la calificación", err instanceof Error ? err.message : undefined)
    } finally {
      setSavingManualResponseId((prev) => (prev === responseId ? null : prev))
    }
  }, [getManualValue, manualEditable, selectedResponse, setManualPoints])

  if (loading && !exam) {
    return (
      <div className="flex items-center justify-center h-full gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-muted-foreground">Cargando examen para calificar...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
        <FileText className="h-12 w-12 text-destructive opacity-60" />
        <p className="text-destructive font-semibold">No se pudo cargar el examen</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack}>Volver</Button>
          <Button onClick={() => refresh()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  if (!exam) {
    return null
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-muted/30">
      <div className="bg-background border-b p-4 sm:p-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold mb-2">{revision.examTitle}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span>{revision.subjectName}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>{revision.studentName}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(revision.createdAt)}</span>
                </div>
              </div>

              {revision.requestReason && (
                <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-blue-700 mb-1">Motivo de recalificación</div>
                      <p className="text-sm text-blue-700">{revision.requestReason}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-1">Progreso</div>
                <div className="text-xl font-semibold">
                  {gradedCount}/{questions.length}
                </div>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-1">Calificación</div>
                <div className={`text-xl font-mono font-semibold ${
                  allQuestionsGraded
                    ? calculatedGrade >= 7 ? "text-green-600" :
                      calculatedGrade >= 5 ? "text-orange-600" : "text-red-600"
                    : "text-muted-foreground"
                }`}>
                  {allQuestionsGraded ? calculatedGrade.toFixed(1) : "--"}/10
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex gap-6 p-4 sm:p-6">
          <Card className="w-80 hidden lg:block">
            <div className="p-4 border-b">
              <h3 className="font-medium">Preguntas del Examen</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Selecciona una pregunta para revisar
              </p>
            </div>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="p-4 space-y-2">
                {questions.map((question) => {
                  const isGradedQuestion = isQuestionGraded(question.questionId)
                  const isSelected = question.questionId === selectedQuestionId
                  const detail = questionDetails[question.questionId]

                  return (
                    <button
                      key={question.questionId}
                      onClick={() => setSelectedQuestionId(question.questionId)}
                      className={`
                        w-full text-left p-3 rounded-lg border-2 transition-all
                        ${isSelected
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:border-muted-foreground/20 hover:bg-muted/50"
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 text-sm font-medium
                          ${isGradedQuestion
                            ? "bg-green-500/10 text-green-700 border-2 border-green-500"
                            : "bg-muted text-muted-foreground"
                          }
                        `}>
                          {isGradedQuestion ? <CheckCircle2 className="h-4 w-4" /> : question.questionIndex}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1">
                            Pregunta {question.questionIndex}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {detail?.body ?? "Detalle disponible al seleccionar"}
                          </div>
                          <Badge variant="secondary" className="text-[11px] mt-2">
                            Puntaje: {question.questionScore}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </Card>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {showQuestionLoader && (
              <Card className="flex-1 flex items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-muted-foreground">Cargando pregunta...</p>
              </Card>
            )}

            {!showQuestionLoader && !selectedQuestion && (
              <Card className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Selecciona una pregunta para calificar</p>
                </div>
              </Card>
            )}

            {!showQuestionLoader && selectedQuestion && (
              <Card className="flex-1 overflow-hidden flex flex-col">
                <div className="p-6 border-b bg-muted/30 flex-shrink-0">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                        {selectedQuestion.questionIndex}
                      </div>
                      <div>
                        <Badge variant="secondary" className="mb-1">
                          {getQuestionTypeLabel(selectedDetail)}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          Puntaje: {selectedQuestion.questionScore} puntos
                        </div>
                      </div>
                    </div>

                    {isQuestionGraded(selectedQuestion.questionId) && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Calificada</span>
                      </div>
                    )}
                  </div>

                  <p className="text-base leading-relaxed font-medium">
                    {selectedDetail?.body ?? "Detalle de la pregunta no disponible"}
                  </p>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-6">
                    {questionError && (
                      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive space-y-2">
                        <p className="font-semibold">Error al cargar la pregunta</p>
                        <p className="text-xs text-destructive">{questionError}</p>
                        {selectedQuestion && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void loadQuestionAssets(selectedQuestion.questionId, selectedQuestion.questionIndex)}
                          >
                            Reintentar
                          </Button>
                        )}
                      </div>
                    )}
                    <div>
                      <Label className="text-base font-medium mb-3 block">Respuesta del estudiante:</Label>
                      {isManualQuestion(selectedDetail, selectedResponse) ? (
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg max-h-64 overflow-y-auto">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {getTextAnswer(selectedResponse) || "Sin respuesta"}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {choiceOptions.map((option, index) => {
                            const isSelected = selectedResponse?.selectedOptions?.some((opt) => opt.text === option.text)
                            return (
                              <div
                                key={index}
                                className={`p-3 rounded-lg border-2 ${
                                  isSelected
                                    ? option.isCorrect
                                      ? "bg-green-50 dark:bg-green-950/20 border-green-500"
                                      : "bg-red-50 dark:bg-red-950/20 border-red-500"
                                    : "bg-muted/30 border-muted"
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  {isSelected && (
                                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                                      option.isCorrect ? "bg-green-500" : "bg-red-500"
                                    }`}>
                                      {option.isCorrect ? (
                                        <CheckCircle2 className="h-3 w-3 text-white" />
                                      ) : (
                                        <span className="text-white text-xs">✕</span>
                                      )}
                                    </div>
                                  )}
                                  <span className={`text-sm ${isSelected ? "font-medium" : ""}`}>
                                    {option.text}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                          {!choiceOptions.length && (
                            <div className="text-sm text-muted-foreground">
                              No hay opciones cargadas para esta pregunta.
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-base font-medium mb-3 block">Respuesta esperada</Label>
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-lg max-h-64 overflow-y-auto">
                        {expectedOptions.length > 0 ? (
                          <div className="space-y-2">
                            {expectedOptions.map((option, index) => (
                              <div
                                key={`${option.text}-${index}`}
                                className={`p-3 rounded-lg border-2 ${
                                  option.isCorrect
                                    ? "bg-green-100 dark:bg-green-900/40 border-green-500"
                                    : "bg-muted/30 border-muted"
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  {option.isCorrect && (
                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                  )}
                                  <span className={`text-sm ${option.isCorrect ? "font-medium text-green-700" : ""}`}>
                                    {option.text}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {selectedDetail?.response ?? "Sin respuesta esperada definida"}
                          </p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-base font-medium mb-3 block">Calificación:</Label>
                      {manualQuestionSelected ? (
                        manualEditable ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <div className="flex-1 max-w-xs">
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    max={maxScore}
                                    step="0.5"
                                    value={manualValue ?? ""}
                                    onChange={(e) => handleManualPointsChange(e.target.value)}
                                    placeholder="0.0"
                                    className="text-center text-lg font-semibold"
                                  />
                                  <span className="text-muted-foreground">/ {maxScore}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Ingresa la puntuación obtenida (máximo {maxScore} puntos)
                                </p>
                              </div>
                            </div>
                            {isRecalification && (
                              <p className="text-xs text-muted-foreground">
                                {manualPointsAssigned !== null
                                  ? `La calificación manual actual es ${manualPointsAssigned}/${maxScore} y se puede ajustar en esta recalificación.`
                                  : "Esta recalificación permite asignar o ajustar la calificación manual sin modificar las automáticas."
                                }
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-4 bg-muted rounded-lg flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Calificación manual</p>
                                  <p className="text-2xl font-mono">
                                    {manualPointsAssigned !== null ? `${manualPointsAssigned}/${maxScore}` : "Sin registrar"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Calificación automática</p>
                                  <p className="text-2xl font-mono">
                                    {autoPointsAssigned !== null ? `${autoPointsAssigned}/${maxScore}` : "Sin registrar"}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20">
                                Pregunta calificada
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {manualPointsAssigned !== null
                                ? "La calificación manual es definitiva para esta pregunta."
                                : "La calificación automática ya fue asignada."}
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="space-y-2">
                          <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
                            <span className="text-sm font-medium">Puntuación obtenida:</span>
                            <div className={`text-2xl font-mono font-semibold ${
                              autoPoints === maxScore ? "text-green-600" : "text-red-600"
                            }`}>
                              {autoPoints}/{maxScore}
                            </div>
                          </div>
                          {isRecalification && (
                            <p className="text-xs text-muted-foreground">
                              Las puntuaciones automáticas se mantienen y no se modifican durante la recalificación.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-6 border-t bg-muted/30 flex-shrink-0">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className={`text-sm ${
                      questionHasPersistedGrade
                        ? "text-green-700"
                        : selectedQuestionGraded
                          ? "text-amber-700"
                          : "text-muted-foreground"
                    }`}>
                      {questionHasPersistedGrade ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Pregunta calificada ({manualPointsAssigned !== null ? "manual" : "automática"}): {selectedTotalPoints}/{maxScore}
                        </span>
                      ) : selectedQuestionGraded && hasManualValue ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Calificación pendiente de guardar: {manualValue}/{maxScore}
                        </span>
                      ) : (
                        <span>Asigna una puntuación para esta pregunta</span>
                      )}
                    </div>
                    {manualEditable && (
                      <Button
                        variant="secondary"
                        onClick={handleSaveManualScore}
                        disabled={manualSaveDisabled}
                      >
                        {manualSaveLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <Save className="h-4 w-4 mr-2" />
                        Guardar calificación
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}

            <Card className="lg:hidden p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">Navegación de Preguntas</h3>
                <span className="text-xs text-muted-foreground">
                  {selectedQuestion ? questions.findIndex(q => q.questionId === selectedQuestion.questionId) + 1 : 0} de {questions.length}
                </span>
              </div>
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  {questions.map((question) => {
                    const isGradedQuestion = isQuestionGraded(question.questionId)
                    const isCurrent = question.questionId === selectedQuestionId

                    return (
                      <button
                        key={question.questionId}
                        onClick={() => setSelectedQuestionId(question.questionId)}
                        className={`
                          flex-shrink-0 w-10 h-10 rounded-md border-2 flex items-center justify-center text-sm font-medium
                          transition-all
                          ${isCurrent
                            ? "border-primary bg-primary text-primary-foreground"
                            : isGradedQuestion
                              ? "border-green-500 bg-green-500/10 text-green-700"
                              : "border-muted-foreground/20 bg-background"
                          }
                        `}
                      >
                        {question.questionIndex}
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            </Card>

            <Card className="p-4 flex-shrink-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {allQuestionsGraded
                      ? "Todas las preguntas calificadas"
                      : `${gradedCount} de ${questions.length} preguntas calificadas`
                    }
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {allQuestionsGraded
                      ? `Calificación final: ${calculatedGrade.toFixed(1)}/10`
                      : "Completa todas las preguntas para guardar"
                    }
                  </p>
                </div>
                <Button
                  onClick={handleFinalize}
                  disabled={!allQuestionsGraded || actionLoading || saving}
                  size="lg"
                >
                  {(actionLoading || saving) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  {finalizeButtonLabel}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
