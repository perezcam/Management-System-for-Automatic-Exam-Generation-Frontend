"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Separator } from "../../ui/separator"
import { ScrollArea } from "../../ui/scroll-area"
import { Textarea } from "../../ui/textarea"
import { Checkbox } from "../../ui/checkbox"
import { Label } from "../../ui/label"
import {
  ArrowLeft,
  Clock,
  Calendar,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  FileText,
  Loader2,
} from "lucide-react"
import { useActiveExam } from "@/hooks/exam-application/use-active-exam"
import { DIFFICULTY_LABELS, STATUS_LABELS } from "@/hooks/exams/use-exams"
import { ExamAssignment, ExamResponse } from "@/types/exam-application/exam"
import { ExamApplicationService, ExamEndpointError } from "@/services/exam-application/exam-application-service"
import { MAX_TOPICS_LIMIT, fetchTopics } from "@/services/question-administration/topics"
import type { QuestionDetail } from "@/types/question-bank/question"

const getLocalizedLabel = (value?: string, labels: Record<string, string>) => {
  if (!value) return ""
  const normalized = value.toUpperCase()
  return labels[value] ?? labels[normalized] ?? value
}

const getStatusLabel = (value?: string) => getLocalizedLabel(value, STATUS_LABELS)
const getDifficultyLabel = (value?: string) => getLocalizedLabel(value, DIFFICULTY_LABELS)

interface ExamTakingViewProps {
  assignment: ExamAssignment
  onBack: () => void
}

type AnswerDraft = {
  selectedOptions: string[]
  textAnswer: string
  submitted: boolean
  responseId?: string
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`
}

const formatPercentage = (value: number) => `${Math.round(value * 100)}%`

const formatApplicationDateTime = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

export function ExamTakingView({ assignment, onBack }: ExamTakingViewProps) {
  const examId = assignment.examId
  const { exam, loading, error, submitAnswer, updateAnswer, submitting } = useActiveExam(examId)

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [localAnswers, setLocalAnswers] = useState<Record<string, AnswerDraft>>({})
  const [questionDetails, setQuestionDetails] = useState<Record<string, QuestionDetail | null>>({})
  const [questionResponses, setQuestionResponses] = useState<Record<string, ExamResponse | null>>({})
  const [questionError, setQuestionError] = useState<string | null>(null)
  const [loadingQuestionAssets, setLoadingQuestionAssets] = useState(false)
  const [topicNames, setTopicNames] = useState<Record<string, string>>({})
  const [hasExpired, setHasExpired] = useState(false)

  const calculateRemainingTime = useCallback(() => {
    const totalSeconds = Math.max(0, assignment.durationMinutes) * 60
    if (!assignment.applicationDate) return totalSeconds
    const startedAt = Date.parse(assignment.applicationDate)
    if (Number.isNaN(startedAt)) return totalSeconds
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
    return Math.max(0, totalSeconds - elapsedSeconds)
  }, [assignment.applicationDate, assignment.durationMinutes])

  const [timeRemaining, setTimeRemaining] = useState(() => calculateRemainingTime())

  useEffect(() => {
    setTimeRemaining(calculateRemainingTime())
  }, [calculateRemainingTime])

  useEffect(() => {
    let cancelled = false
    const loadTopics = async () => {
      try {
        const { data: topics } = await fetchTopics({ limit: MAX_TOPICS_LIMIT, offset: 0 })
        if (cancelled) return
        const map: Record<string, string> = {}
        const addEntry = (id?: string, name?: string) => {
          if (!id || !name) return
          map[id] = name
          map[id.toLowerCase()] = name
        }
        topics.forEach((topic) => {
          addEntry(topic.topic_id, topic.topic_name)
          addEntry((topic as any).id, (topic as any).name)
        })
        if (!cancelled) setTopicNames(map)
      } catch {
        if (cancelled) return
      }
    }
    void loadTopics()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!exam) return
    if (!selectedQuestionId && exam.questions.length > 0) {
      setSelectedQuestionId(exam.questions[0].questionId)
    }
  }, [exam, selectedQuestionId])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateRemainingTime())
    }, 1000)
    return () => clearInterval(timer)
  }, [calculateRemainingTime])

  useEffect(() => {
    if (!hasExpired && timeRemaining === 0) {
      setHasExpired(true)
      onBack()
    }
  }, [hasExpired, onBack, timeRemaining])

  const activeQuestion = selectedQuestionId
    ? exam?.questions.find((q) => q.questionId === selectedQuestionId)
    : undefined

  useEffect(() => {
    let cancelled = false

    const loadQuestionAssets = async () => {
      if (!activeQuestion) {
        setQuestionError(null)
        return
      }

      setLoadingQuestionAssets(true)
      setQuestionError(null)

      try {
        const [detailResponse, response] = await Promise.all([
          ExamApplicationService.getQuestionByIndex(examId, activeQuestion.questionIndex),
          ExamApplicationService.getResponseByIndex(examId, activeQuestion.questionIndex),
        ])

        if (cancelled) return

        const normalizedDetail: QuestionDetail = {
          ...detailResponse,
          questionId: activeQuestion.questionId,
        }

        setQuestionDetails((prev) => ({ ...prev, [activeQuestion.questionId]: normalizedDetail }))
        setQuestionResponses((prev) => ({ ...prev, [activeQuestion.questionId]: response }))

        setLocalAnswers((prev) => ({
          ...prev,
          [activeQuestion.questionId]: {
            selectedOptions:
              response?.selectedOptions?.map((option) => option.text) ??
              prev[activeQuestion.questionId]?.selectedOptions ??
              [],
            textAnswer:
              response?.textAnswer ??
              response?.textResponse ??
              prev[activeQuestion.questionId]?.textAnswer ??
              "",
            submitted: Boolean(response),
            responseId: response?.id ?? prev[activeQuestion.questionId]?.responseId,
          },
        }))
      } catch (err) {
        if (cancelled) return

        setQuestionDetails((prev) => ({ ...prev, [activeQuestion.questionId]: null }))
        setQuestionResponses((prev) => ({ ...prev, [activeQuestion.questionId]: null }))

        let message = "No fue posible cargar la pregunta."
        if (err instanceof ExamEndpointError) {
          if (err.status === 403) message = "No tienes permiso para acceder a esta pregunta."
          else if (err.status === 404) message = "No se encontró la pregunta solicitada."
          else message = err.message
        } else if (err instanceof Error && err.message) {
          message = err.message
        }

        setQuestionError(message)
      } finally {
        if (!cancelled) setLoadingQuestionAssets(false)
      }
    }

    void loadQuestionAssets()

    return () => {
      cancelled = true
    }
  }, [activeQuestion, examId])

  const resolveTopicName = (topicId?: string) => {
    if (!topicId) return topicId ?? ""
    const normalized = topicId.toLowerCase()
    return topicNames[topicId] ?? topicNames[normalized] ?? topicId
  }

  const currentAnswer = selectedQuestionId ? localAnswers[selectedQuestionId] : undefined
  const currentResponse = selectedQuestionId ? questionResponses[selectedQuestionId] : null
  const selectedQuestionDetail = selectedQuestionId ? questionDetails[selectedQuestionId] : null
  const questionDetailKey = selectedQuestionDetail?.questionId ?? selectedQuestionId ?? "question"
  const answeredCount = Object.values(localAnswers).filter((answer) => answer.submitted).length

  const isMultipleChoice = (detail?: QuestionDetail | null) => (detail?.options?.length ?? 0) > 0

  const handleCheckboxChange = (questionId: string, optionText: string, checked: boolean) => {
    setLocalAnswers((prev) => {
      const current = prev[questionId] ?? {
        selectedOptions: [],
        textAnswer: "",
        submitted: false,
        responseId: prev[questionId]?.responseId,
      }

      const selectedOptions = checked
        ? Array.from(new Set([...current.selectedOptions, optionText]))
        : current.selectedOptions.filter((opt) => opt !== optionText)

      return {
        ...prev,
        [questionId]: {
          ...current,
          selectedOptions,
          submitted: false,
          responseId: current.responseId,
        },
      }
    })
  }

  const handleEssayChange = (questionId: string, value: string) => {
    setLocalAnswers((prev) => {
      const current = prev[questionId] ?? {
        selectedOptions: [],
        textAnswer: "",
        submitted: false,
        responseId: prev[questionId]?.responseId,
      }

      return {
        ...prev,
        [questionId]: {
          ...current,
          textAnswer: value,
          submitted: false,
          responseId: current.responseId,
        },
      }
    })
  }

  const handleSaveAnswer = async () => {
    if (!selectedQuestionId) return
    const answer = localAnswers[selectedQuestionId]
    if (!answer) return

    const trimmedTextAnswer = answer.textAnswer.trim()
    if (!answer.selectedOptions.length && !trimmedTextAnswer) return
    if (!activeQuestion?.id) return

    const detail = questionDetails[selectedQuestionId]
    const selectedOptionPayload =
      detail?.options && answer.selectedOptions.length
        ? answer.selectedOptions
            .map((text) => detail.options?.find((option) => option.text === text))
            .filter((option): option is QuestionDetail["options"][number] => Boolean(option))
            .map((option) => ({
              text: option.text,
              isCorrect: Boolean(option.isCorrect),
            }))
        : null

    const normalizedSelectedOptions =
      selectedOptionPayload && selectedOptionPayload.length ? selectedOptionPayload : null
    const normalizedTextAnswer = trimmedTextAnswer ? trimmedTextAnswer : null

    const createPayload = {
      examId: exam?.id ?? assignment.examId,
      examQuestionId: activeQuestion.id,
      selectedOptions: normalizedSelectedOptions,
      textAnswer: normalizedTextAnswer,
    }

    const updatePayload = {
      selectedOptions: normalizedSelectedOptions,
      textAnswer: normalizedTextAnswer,
    }

    const savedResponse = answer.responseId
      ? await updateAnswer(answer.responseId, updatePayload)
      : await submitAnswer(createPayload)

    if (!savedResponse) return

    setLocalAnswers((prev) => ({
      ...prev,
      [selectedQuestionId]: {
        ...prev[selectedQuestionId],
        selectedOptions: savedResponse.selectedOptions?.map((option) => option.text) ?? [],
        textAnswer: savedResponse.textAnswer ?? savedResponse.textResponse ?? "",
        submitted: true,
        responseId: savedResponse.id,
      },
    }))
    setQuestionResponses((prev) => ({ ...prev, [selectedQuestionId]: savedResponse }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span>Cargando examen...</span>
      </div>
    )
  }

  if (error || !exam) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-destructive">Error al cargar el examen</p>
        <Button onClick={onBack}>Volver</Button>
      </div>
    )
  }

  const topicProportionEntries = exam.topicProportion ? Object.entries(exam.topicProportion) : []
  const coverage = exam.topicCoverage
  const coverageTopicNames = coverage?.topicIds?.map((topicId) => resolveTopicName(topicId)) ?? []

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-muted/30">
      {/* HEADER FULL-WIDTH (anti-centrado en recargas) */}
      <div className="border-b bg-background">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Examen</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-semibold break-words">{exam.title}</h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  <span>{assignment.teacherName}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span>{assignment.subjectName}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{assignment.durationMinutes} min</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{formatApplicationDateTime(assignment.applicationDate)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <div>
                  <span className="font-semibold uppercase tracking-wide">Dificultad</span>:{" "}
                  {getDifficultyLabel(exam.difficulty)}
                </div>
                <div>
                  <span className="font-semibold uppercase tracking-wide">Preguntas</span>:{" "}
                  {exam.questionCount}
                </div>
                <div>
                  <span className="font-semibold uppercase tracking-wide">Estado</span>:{" "}
                  {getStatusLabel(exam.examStatus)}
                </div>
              </div>

              {topicProportionEntries.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs mt-2">
                  <span className="text-muted-foreground uppercase tracking-wide font-semibold">
                    Proporción por tema
                  </span>
                  {topicProportionEntries.map(([topicId, value]) => {
                    const topicLabel = resolveTopicName(topicId)
                    return (
                      <Badge key={topicId} variant="secondary" className="text-[11px]">
                        {topicLabel}: {formatPercentage(value)}
                      </Badge>
                    )
                  })}
                </div>
              )}

              {coverage && coverageTopicNames.length > 0 && (
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                  <span>Temas: {coverageTopicNames.join(", ")}</span>
                </div>
              )}
            </div>

            {/* Bloque derecho: tiempo + progreso (no se “centra”) */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-1">Tiempo Restante</div>
                <div className="flex items-center justify-end gap-2">
                  <Clock className={`h-4 w-4 ${timeRemaining < 600 ? "text-red-600" : "text-orange-600"}`} />
                  <span
                    className={`text-xl font-mono font-semibold ${
                      timeRemaining < 600 ? "text-red-600" : "text-orange-600"
                    }`}
                  >
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>

              <Separator orientation="vertical" className="h-12" />

              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-1">Progreso</div>
                <div className="text-xl font-semibold">
                  {answeredCount}/{exam.questions.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO FULL-WIDTH + FLEX ESTABLE */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full h-full px-4 sm:px-6 py-4 sm:py-6">
          <div className="h-full flex gap-6 min-h-0">
            {/* Sidebar */}
            <Card className="w-80 hidden lg:flex lg:flex-col min-h-0">
              <div className="p-4 border-b">
                <h3 className="font-medium">Preguntas del Examen</h3>
                <p className="text-xs text-muted-foreground mt-1">Selecciona una pregunta para responder</p>
              </div>

              <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-2">
                  {exam.questions.map((question) => {
                    const answer = localAnswers[question.questionId]
                    const isAnswered = answer?.submitted
                    const isSelected = question.questionId === selectedQuestionId
                    const previewBody =
                      questionDetails[question.questionId]?.body ?? "Detalle disponible al seleccionar"

                    return (
                      <button
                        key={question.questionId}
                        onClick={() => setSelectedQuestionId(question.questionId)}
                        className={`
                          w-full text-left p-3 rounded-lg border-2 transition-all
                          ${isSelected ? "border-primary bg-primary/5" : "border-transparent hover:border-muted-foreground/30 hover:bg-muted/50"}
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`
                              flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 text-sm font-medium
                              ${isAnswered ? "bg-green-500/10 text-green-700 border-2 border-green-500" : "bg-muted text-muted-foreground"}
                            `}
                          >
                            {isAnswered ? <CheckCircle2 className="h-4 w-4" /> : question.questionIndex}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm mb-1">Pregunta {question.questionIndex}</div>
                            <div className="text-[13px] text-muted-foreground truncate">{previewBody}</div>
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

            {/* Panel principal */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {loadingQuestionAssets && !selectedQuestionDetail && !questionError ? (
                <Card className="flex-1 flex items-center justify-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-muted-foreground">Cargando pregunta...</p>
                </Card>
              ) : questionError ? (
                <Card className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <FileText className="h-12 w-12 text-destructive opacity-60" />
                  <p className="text-sm font-semibold text-destructive">{questionError}</p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Si el problema persiste, intenta volver a cargar la página o ponte en contacto con tu docente.
                  </p>
                </Card>
              ) : selectedQuestionDetail ? (
                <Card className="flex-1 min-h-0 overflow-hidden flex flex-col">
                  <div className="p-6 border-b bg-muted/30">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                          {activeQuestion?.questionIndex ?? "-"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Puntaje: {activeQuestion?.questionScore ?? "N/A"}
                        </div>
                      </div>

                      {currentAnswer?.submitted && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Respondida</span>
                        </div>
                      )}
                    </div>

                    <p className="text-base leading-relaxed">{selectedQuestionDetail.body}</p>
                  </div>

                  <ScrollArea className="flex-1 min-h-0">
                    <div className="p-6 space-y-6">
                      {isMultipleChoice(selectedQuestionDetail) && (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground mb-4">
                            Selecciona la(s) opción(es) correcta(s)
                          </p>
                          {selectedQuestionDetail.options?.map((option, index) => (
                            <div
                              key={index}
                              className="flex items-start space-x-3 p-4 rounded-lg border-2 hover:border-primary/50 transition-colors"
                            >
                              <Checkbox
                                id={`option-${questionDetailKey}-${index}`}
                                checked={currentAnswer?.selectedOptions.includes(option.text) || false}
                                onCheckedChange={(checked) =>
                                  handleCheckboxChange(selectedQuestionDetail.questionId, option.text, checked as boolean)
                                }
                              />
                              <Label
                                htmlFor={`option-${questionDetailKey}-${index}`}
                                className="flex-1 cursor-pointer leading-relaxed"
                              >
                                {option.text}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}

                      {!isMultipleChoice(selectedQuestionDetail) && (
                        <div>
                          <Label htmlFor="essay-answer" className="mb-2 block">
                            Tu respuesta:
                          </Label>
                          <Textarea
                            id="essay-answer"
                            value={currentAnswer?.textAnswer || ""}
                            onChange={(e) => handleEssayChange(selectedQuestionDetail.questionId, e.target.value)}
                            placeholder="Escribe tu respuesta aquí..."
                            className="min-h-[300px] resize-none"
                          />
                          <div className="text-xs text-muted-foreground mt-2">
                            {currentAnswer?.textAnswer?.length || 0} caracteres
                          </div>
                        </div>
                      )}

                      {currentResponse?.feedback && (
                        <div className="text-sm italic text-muted-foreground">
                          Feedback: {currentResponse.feedback}
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <div className="p-6 border-t bg-muted/30">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm text-muted-foreground">
                        {currentAnswer?.submitted ? (
                          <span className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Respuesta guardada
                          </span>
                        ) : (
                          <span>Selecciona tus respuestas y guarda para continuar</span>
                        )}
                      </div>

                      <Button
                        onClick={handleSaveAnswer}
                        disabled={
                          submitting ||
                          loadingQuestionAssets ||
                          !currentAnswer ||
                          (!currentAnswer.selectedOptions.length && !currentAnswer.textAnswer?.trim())
                        }
                        variant={currentAnswer?.submitted ? "secondary" : "default"}
                      >
                        {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {currentAnswer?.submitted ? "Actualizar Respuesta" : "Guardar Respuesta"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Selecciona una pregunta para comenzar</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
