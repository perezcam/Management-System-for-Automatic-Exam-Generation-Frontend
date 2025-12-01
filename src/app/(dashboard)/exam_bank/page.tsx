"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Filter, GripVertical, Loader2, Plus, Search, Trash, Trash2 } from "lucide-react"
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { ExamBankHeader } from "@/components/dashboard/exam-bank/exam-bank-header"
import { ExamFiltersDialog, type SelectOption } from "@/components/dashboard/exam-bank/exam-filters-dialog"
import { ExamList } from "@/components/dashboard/exam-bank/exam-list"
import { EmptyState } from "@/components/dashboard/exam-bank/empty-state"
import { ExamCreationDialog } from "@/components/dashboard/exam-bank/exam-creation-dialog"
import { ManualExamFormDialog } from "@/components/dashboard/exam-bank/manual-exam-form"
import { AutomaticExamFormDialog } from "@/components/dashboard/exam-bank/automatic-exam-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DIFFICULTY_LABELS, STATUS_LABELS, type ExamQuestionItem, useExams } from "@/hooks/exams/use-exams"
import { useQuestionBank } from "@/hooks/questions/use-question-bank"
import type { QuestionListItem } from "@/types/question-bank/view"
import type { AutomaticExamForm, ManualExamForm, SelectedQuestion, Subject } from "@/components/dashboard/exam-bank/types"
import {
  distributeScoreEvenly,
  isScoreSumValid,
  sanitizeScoreValue,
  sumScores,
  TOTAL_EXAM_SCORE,
} from "@/utils/exam-scores"

const formatDateLabel = (value?: string | null) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })
}

const getStatusLabel = (value?: string) => {
  if (!value) return ""
  const normalized = value.toUpperCase()
  return STATUS_LABELS[value] ?? STATUS_LABELS[normalized] ?? value
}

const getDifficultyLabel = (value?: string) => {
  if (!value) return ""
  const normalized = value.toUpperCase()
  return DIFFICULTY_LABELS[value] ?? DIFFICULTY_LABELS[normalized] ?? value
}

const difficultyLabelToEnum: Record<string, string> = {
  "Fácil": "EASY",
  "Regular": "MEDIUM",
  "Difícil": "HARD",
}

type SortableExamQuestionRowProps = {
  question: ExamQuestionItem
  index: number
  onRemove: (questionId: string) => void
  onScoreChange: (questionId: string, nextValue: number) => void
  disabled?: boolean
  subtopicLabel?: string
  topicLabel?: string
}

function SortableExamQuestionRow({
  question,
  index,
  onRemove,
  onScoreChange,
  disabled,
  subtopicLabel,
  topicLabel,
}: SortableExamQuestionRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.key,
    disabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  const preview = question as ExamQuestionItem & { previewBody?: string; previewDifficulty?: string }
  const difficultyLabel =
    getDifficultyLabel(question.detail?.difficulty) || preview.previewDifficulty || ""
  const bodyText = question.detail?.body ?? preview.previewBody ?? "Pregunta agregada"

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 border rounded-lg bg-background flex items-start gap-3"
    >
      <div
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing mt-1 ${disabled ? "opacity-50" : ""}`}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <span className="text-sm font-medium mt-1">{index + 1}.</span>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          {topicLabel ? <Badge variant="secondary">{topicLabel}</Badge> : null}
          {subtopicLabel ? <Badge variant="outline">{subtopicLabel}</Badge> : null}
          {difficultyLabel ? <Badge variant="secondary">{difficultyLabel}</Badge> : null}
        </div>
        <p className="text-sm break-words text-muted-foreground">
          {bodyText}
        </p>
        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Puntaje</span>
            <Input
              type="number"
              min={0}
              max={TOTAL_EXAM_SCORE}
              step={0.5}
              value={question.questionScore ?? 0}
              onChange={(event) => onScoreChange(question.questionId, Number(event.target.value))}
              className="w-20"
              aria-label="Valor de la pregunta"
            />
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(question.questionId)}
        disabled={disabled}
        aria-label="Eliminar pregunta"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  )
}

export default function BancoExamenesView() {
  const {
    exams,
    filters,
    setFilters,
    search,
    setSearch,
    loading,
    error,
    total,
    page,
    pageSize,
    setPage,
    availableSubjects,
    availableAuthors,
    availableStatuses,
    availableDifficulties,
    selectedExamId,
    selectedExam,
    selectedExamQuestions,
    selectedExamLoading,
    selectedExamError,
    savingExam,
    deletingExam,
    sendingForReview,
    selectExam,
    refreshSelectedExam,
    deleteExam,
    sendExamForReview,
    createManual,
    createAutomatic,
    creatingExam,
    saveExamQuestions,
    getQuestionsWithDetails,
  } = useExams()

  // ... (existing code)

  const handleAutomaticSubmit = async () => {
    if (creatingExam) return
    if (!automaticForm.name || !automaticForm.subject) return
    const difficultyDistribution = automaticForm.difficultyDistribution.map((item) => ({
      difficulty: difficultyLabelToEnum[item.difficulty] ?? item.difficulty,
      count: item.count,
    }))

    const questionTypeDistribution = automaticForm.questionTypeDistribution.map((item) => {
      const backendName = QUESTION_TYPE_LABEL_TO_NAME[item.type] ?? item.type
      const typeId =
        questionTypeIdByName.get(backendName) ||
        questionTypeIdByName.get(backendName.toUpperCase())
      return {
        type: typeId ?? item.type,
        count: item.count,
      }
    })

    const resolvedTopics = automaticForm.topicCoverage.map((subtopicName) => {
      const id = subtopicNameToTopicId.get(subtopicName) ?? subtopicNameToTopicId.get(subtopicName.toLowerCase())
      return id
    })

    if (resolvedTopics.some((id) => !id)) {
      setExamActionError(
        "No se pudieron resolver los tópicos de los subtópicos seleccionados. Refresca el catálogo e intenta de nuevo.",
      )
      return
    }

    const topicCoverage = Array.from(new Set(resolvedTopics.filter(Boolean) as string[]))

    const subtopicDistribution = automaticForm.subtopicDistribution
      .map((item) => {
        const subtopicId =
          subtopicIdByName.get(item.subtopic) ?? subtopicIdByName.get(item.subtopic.toLowerCase())
        if (!subtopicId) return null
        return { subtopic: subtopicId, count: item.count }
      })
      .filter(Boolean) as Array<{ subtopic: string; count: number }>

    const hasMissingQuestionTypes = questionTypeDistribution.some(
      (item, index) =>
        !questionTypeIdByName.size || item.type === automaticForm.questionTypeDistribution[index].type,
    )
    if (hasMissingQuestionTypes) {
      setExamActionError(
        "No se pudieron resolver los tipos de pregunta seleccionados. Refresca el catálogo e intenta de nuevo.",
      )
      return
    }

    if (subtopicDistribution.length !== automaticForm.subtopicDistribution.length) {
      setExamActionError(
        "No se pudieron resolver los subtópicos seleccionados. Refresca el catálogo e intenta de nuevo.",
      )
      return
    }

    try {
      const preview = await createAutomatic({
        title: automaticForm.name,
        subjectId: automaticForm.subject,
        questionCount: automaticForm.totalQuestions,
        questionTypeDistribution,
        difficultyDistribution,
        topicCoverage,
        subtopicDistribution,
      })

      if (preview) {
        const questionsWithDetails = getQuestionsWithDetails(preview.questions)
        const defaultScores = distributeScoreEvenly(questionsWithDetails.length)

        const mappedQuestions: SelectedQuestion[] = questionsWithDetails.map((q, index) => {
          const difficulty = getDifficultyLabel(q.detail?.difficulty) as "Fácil" | "Regular" | "Difícil"
          // Find type name by ID
          const typeName = questionTypes.find(t => t.id === q.detail?.questionTypeId)?.name || "Desconocido"

          return {
            id: q.questionId,
            topic: "", // Topic name not strictly needed for the list view usually, or we can look it up
            subtopic: subtopicIdToName.get(q.detail?.subtopicId ?? "") ?? "",
            difficulty: difficulty || "Regular",
            type: typeName,
            body: q.detail?.body ?? "Pregunta sin cuerpo",
            options: q.detail?.options?.map(o => o.text),
            score: typeof q.questionScore === "number" ? q.questionScore : defaultScores[index] ?? 0,
          }
        })

        setManualForm({
          name: preview.title,
          subject: preview.subjectId,
          selectedQuestions: mappedQuestions
        })

        setExamActionError(null)
        setShowAutomaticDialog(false)
        setIsAutomaticPreview(true)
        setShowManualDialog(true)
        // Do NOT reset automatic form yet, in case they want to go back? 
        // Or reset it. The user flow implies they move forward.
        resetAutomaticForm()
      }

    } catch (err) {
      setExamActionError(err instanceof Error ? err.message : "No se pudo generar el examen")
    }
  }

  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [tempFilters, setTempFilters] = useState(filters)
  const [showAddQuestionDialog, setShowAddQuestionDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSendForReviewDialog, setShowSendForReviewDialog] = useState(false)
  const [examActionError, setExamActionError] = useState<string | null>(null)
  const [showCreationDialog, setShowCreationDialog] = useState(false)
  const [showManualDialog, setShowManualDialog] = useState(false)
  const [showAutomaticDialog, setShowAutomaticDialog] = useState(false)
  const [isAutomaticPreview, setIsAutomaticPreview] = useState(false)
  const [draftQuestions, setDraftQuestions] = useState<ExamQuestionItem[]>([])
  const [questionsDirty, setQuestionsDirty] = useState(false)
  const [manualForm, setManualForm] = useState<ManualExamForm>({
    name: "",
    subject: "",
    selectedQuestions: [],
  })
  const [automaticForm, setAutomaticForm] = useState<AutomaticExamForm>({
    name: "",
    subject: "",
    totalQuestions: 1,
    questionTypeDistribution: [],
    difficultyDistribution: [],
    topicCoverage: [],
    subtopicDistribution: [],
  })
  const resetManualForm = useCallback(
    () =>
      setManualForm({
        name: "",
        subject: "",
        selectedQuestions: [],
      }),
    [],
  )
  const resetAutomaticForm = useCallback(
    () =>
      setAutomaticForm({
        name: "",
        subject: "",
        totalQuestions: 1,
        questionTypeDistribution: [],
        difficultyDistribution: [],
        topicCoverage: [],
        subtopicDistribution: [],
      }),
    [],
  )

  const {
    questions: availableQuestions,
    loading: questionsLoading,
    error: questionBankError,
    total: questionsTotal,
    page: questionPage,
    pageSize: questionPageSize,
    setPage: setQuestionPage,
    filters: questionFilters,
    setFilters: setQuestionFilters,
    search: questionSearch,
    setSearch: setQuestionSearch,
    uniqueSubtopicNames,
    uniqueQuestionTypeNames,
    availableSubtopics,
    questionTypes,
    refresh: refreshQuestionBank,
    topics,
  } = useQuestionBank(3)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    if (showFiltersDialog) {
      setTempFilters(filters)
    }
  }, [filters, showFiltersDialog])

  const totalItems = total ?? exams.length
  const totalPages = totalItems ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1
  const canPrevPage = page > 1
  const canNextPage = page < totalPages

  const subjectOptions = useMemo(
    () => availableSubjects.map((subject) => ({ id: subject.subject_id, name: subject.subject_name })),
    [availableSubjects]
  )

  const difficultyOptions = useMemo<SelectOption[]>(() => {
    const values = availableDifficulties.length ? availableDifficulties : ["EASY", "MEDIUM", "HARD", "MIXED"]
    return values.map((value) => ({
      value,
      label: getDifficultyLabel(value),
    }))
  }, [availableDifficulties])

  const statusOptions = useMemo<SelectOption[]>(() => {
    const values = availableStatuses.length ? availableStatuses : ["UNDER_REVIEW", "APPROVED", "REJECTED", "DRAFT"]
    return values.map((value) => ({
      value,
      label: getStatusLabel(value),
    }))
  }, [availableStatuses])

  const selectedExamListItem = useMemo(
    () => exams.find((exam) => exam.id === selectedExamId),
    [exams, selectedExamId],
  )

  const selectedExamQuestionIds = useMemo(
    () => new Set(draftQuestions.map((item) => item.questionId)),
    [draftQuestions],
  )

  const selectedSubjectName = useMemo(() => {
    if (!selectedExam) return selectedExamListItem?.subjectName ?? ""
    const subject = availableSubjects.find((item) => item.subject_id === selectedExam.subjectId)
    return subject?.subject_name ?? selectedExamListItem?.subjectName ?? ""
  }, [availableSubjects, selectedExam, selectedExamListItem])

  const statusLabel = selectedExam
    ? getStatusLabel(selectedExam.examStatus) || selectedExamListItem?.statusLabel || selectedExam.examStatus
    : selectedExamListItem?.statusLabel ?? ""

  const difficultyLabel = selectedExam
    ? getDifficultyLabel(selectedExam.difficulty) || selectedExamListItem?.difficultyLabel || selectedExam.difficulty
    : selectedExamListItem?.difficultyLabel ?? ""

  const subjectsForForms: Subject[] = useMemo(
    () =>
      availableSubjects.map((subject) => {
        const relatedTopics = topics.filter((topic: any) => {
          const topicSubjects = (topic as any).subjects ?? []
          return topicSubjects.some(
            (entry: any) => entry.subject_id === subject.subject_id || entry.id === subject.subject_id,
          )
        })
        return {
          id: subject.subject_id,
          name: subject.subject_name,
          topics: relatedTopics.map((topic) => ({
            id: topic.topic_id,
            name: topic.topic_name,
            subtopics: (topic.subtopics ?? []).map((subtopic) => subtopic.subtopic_name),
          })),
        }
      }),
    [availableSubjects, topics],
  )

  const subtopicsBySubjectId = useMemo(() => {
    const map = new Map<string, string[]>()
    subjectsForForms.forEach((subject) => {
      const subtopics = subject.topics.flatMap((topic) => topic.subtopics).filter(Boolean)
      map.set(subject.id, subtopics)
    })
    return map
  }, [subjectsForForms])

  const subtopicsForCurrentSelection = useMemo(() => {
    const subjectId = selectedExam?.subjectId ?? selectedExamListItem?.subjectId ?? ""
    if (subjectId && subtopicsBySubjectId.has(subjectId)) {
      return subtopicsBySubjectId.get(subjectId) ?? []
    }
    return []
  }, [selectedExam, selectedExamListItem, subtopicsBySubjectId])

  const questionSubtopicOptions = useMemo(() => {
    const allowed = subtopicsForCurrentSelection.length ? subtopicsForCurrentSelection : uniqueSubtopicNames
    if (allowed.length) return Array.from(new Set(allowed))
    return availableSubtopics.map((s) => s.name)
  }, [availableSubtopics, subtopicsForCurrentSelection, uniqueSubtopicNames])

  const questionTypeOptions = useMemo(
    () => (uniqueQuestionTypeNames.length ? uniqueQuestionTypeNames : []),
    [uniqueQuestionTypeNames],
  )

  const questionTypeIdByName = useMemo(() => {
    const map = new Map<string, string>()
    questionTypes.forEach((type) => {
      if (type.name && type.id) {
        map.set(type.name, type.id)
        map.set(type.name.toUpperCase(), type.id)
      }
    })
    return map
  }, [questionTypes])

  const QUESTION_TYPE_LABEL_TO_NAME: Record<string, string> = {
    "Ensayo": "ESSAY",
    "Opción Múltiple": "MCQ",
    "Verdadero/Falso": "TRUE_FALSE",
  }

  const subtopicIdByName = useMemo(() => {
    const map = new Map<string, string>()
    availableSubtopics.forEach((subtopic) => {
      if (subtopic.name && subtopic.id) {
        map.set(subtopic.name, subtopic.id)
        map.set(subtopic.name.toLowerCase(), subtopic.id)
      }
    })
    return map
  }, [availableSubtopics])

  const subtopicNameToTopicId = useMemo(() => {
    const map = new Map<string, string>()
    topics.forEach((topic: any) => {
      const topicId = topic.topic_id ?? topic.id
      topic.subtopics?.forEach((subtopic: any) => {
        const name = subtopic.subtopic_name ?? subtopic.name
        if (name && topicId) {
          map.set(name, topicId)
          map.set(name.toLowerCase(), topicId)
        }
      })
    })
    return map
  }, [topics])

  const questionsTotalItems = questionsTotal ?? availableQuestions.length
  const questionsTotalPages = questionsTotalItems
    ? Math.max(1, Math.ceil(questionsTotalItems / questionPageSize))
    : 1
  const canPrevQuestions = questionPage > 1
  const canNextQuestions = questionPage < questionsTotalPages

  const selectableQuestions: SelectedQuestion[] = useMemo(
    () =>
      availableQuestions.map((question) => ({
        id: question.id,
        topic: "",
        subtopic: question.subtopic,
        difficulty: question.difficulty,
        type: question.type,
        body: question.body,
        options: question.options,
        score: 0,
      })),
    [availableQuestions],
  )

  const selectableQuestionsForCurrentExam = useMemo(() => {
    if (subtopicsForCurrentSelection.length === 0) return selectableQuestions
    const allowed = new Set(subtopicsForCurrentSelection)
    return selectableQuestions.filter((question) => allowed.has(question.subtopic))
  }, [selectableQuestions, subtopicsForCurrentSelection])

  const topicNamesMap = useMemo(() => {
    const map = new Map<string, string>()
    topics.forEach((topic: any) => {
      if (topic.topic_id && topic.topic_name) {
        map.set(topic.topic_id, topic.topic_name)
      }
      if (topic.id && topic.name) {
        map.set(topic.id, topic.name)
      }
    })
    return map
  }, [topics])

  const subtopicIdToName = useMemo(() => {
    const map = new Map<string, string>()
    topics.forEach((topic: any) => {
      topic.subtopics?.forEach((subtopic: any) => {
        const id = subtopic.subtopic_id ?? subtopic.id
        const name = subtopic.subtopic_name ?? subtopic.name
        if (id && name) {
          map.set(id, name)
        }
      })
    })
    return map
  }, [topics])

  const subtopicIdToTopicName = useMemo(() => {
    const map = new Map<string, string>()
    topics.forEach((topic: any) => {
      const topicName = topicNamesMap.get(topic.topic_id) ?? topic.topic_name ?? topic.name ?? ""
      topic.subtopics?.forEach((subtopic: any) => {
        const id = subtopic.subtopic_id ?? subtopic.id
        if (id) {
          map.set(id, topicName)
        }
      })
    })
    return map
  }, [topicNamesMap, topics])

  const handleApplyFilters = () => {
    setFilters(tempFilters)
    setShowFiltersDialog(false)
  }

  const handleOpenFiltersDialog = () => {
    setTempFilters(filters)
    setShowFiltersDialog(true)
  }

  const changePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage === page || nextPage > totalPages) return
    setPage(nextPage)
  }

  const changeQuestionPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage === questionPage || nextPage > questionsTotalPages) return
    setQuestionPage(nextPage)
  }

  useEffect(() => {
    setDraftQuestions(selectedExamQuestions)
    setQuestionsDirty(false)
  }, [selectedExamQuestions])

  const handleManualSubmit = async () => {
    if (creatingExam) return
    if (!manualForm.name || !manualForm.subject || manualForm.selectedQuestions.length === 0) return
    const questionScores = manualForm.selectedQuestions.map((question) => question.score ?? 0)
    const totalScore = sumScores(questionScores)
    if (!isScoreSumValid(questionScores)) {
      setExamActionError(
        `Los puntajes deben sumar ${TOTAL_EXAM_SCORE} (actualmente ${totalScore.toFixed(2)})`,
      )
      return
    }
    const questionsPayload = manualForm.selectedQuestions.map((question, index) => ({
      questionId: question.id,
      questionIndex: index + 1,
      questionScore: question.score ?? 0,
    }))
    try {
      await createManual({
        title: manualForm.name,
        subjectId: manualForm.subject,
        questions: questionsPayload,
      })
      setExamActionError(null)
      setShowManualDialog(false)
      setShowCreationDialog(false)
      resetManualForm()
    } catch (err) {
      setExamActionError(err instanceof Error ? err.message : "No se pudo crear el examen manual")
    }
  }



  useEffect(() => {
    if (showAddQuestionDialog) {
      void refreshQuestionBank()
    }
  }, [refreshQuestionBank, showAddQuestionDialog])

  useEffect(() => {
    if (showManualDialog || showAutomaticDialog) {
      void refreshQuestionBank()
    }
  }, [refreshQuestionBank, showAutomaticDialog, showManualDialog])

  useEffect(() => {
    setExamActionError(null)
  }, [selectedExamId])

  const handleDragEnd = (event: DragEndEvent) => {
    if (!draftQuestions.length) return
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = draftQuestions.findIndex((q) => q.key === active.id)
    const newIndex = draftQuestions.findIndex((q) => q.key === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    setDraftQuestions((prev) => {
      const next = [...prev]
      const [moved] = next.splice(oldIndex, 1)
      next.splice(newIndex, 0, moved)
      return next.map((q, idx) => ({ ...q, questionIndex: idx + 1 }))
    })
    setQuestionsDirty(true)
  }

  const handleAddQuestion = (question: QuestionListItem) => {
    const examId = selectedExamId ?? selectedExam?.id ?? ""
    if (!examId) return
    setDraftQuestions((prev) => {
      if (prev.some((item) => item.questionId === question.id)) return prev
      const key = `temp-${question.id}-${Date.now()}`
      const currentScore = sumScores(prev.map((item) => item.questionScore ?? 0))
      const remainingPoints = Math.max(0, TOTAL_EXAM_SCORE - currentScore)
      const questionScore = remainingPoints > 0 ? remainingPoints : 0
      const next = [
        ...prev,
        {
          id: key,
          key,
          examId,
          questionId: question.id,
          questionIndex: prev.length + 1,
          detail: undefined,
          // datos de vista previa para mostrar algo mientras no hay detail
          previewBody: question.body,
          previewDifficulty: question.difficulty,
          questionScore,
        } as ExamQuestionItem & { previewBody?: string; previewDifficulty?: string },
      ]
      return next
    })
    setQuestionsDirty(true)
    setExamActionError(null)
    setShowAddQuestionDialog(false)
  }

  const handleRemoveDraftQuestion = (questionId: string) => {
    setDraftQuestions((prev) =>
      prev
        .filter((q) => q.questionId !== questionId)
        .map((q, idx) => ({ ...q, questionIndex: idx + 1 })),
    )
    setQuestionsDirty(true)
  }

  const handleDraftQuestionScoreChange = (questionId: string, nextValue: number) => {
    const sanitized = sanitizeScoreValue(nextValue)
    setDraftQuestions((prev) =>
      prev.map((question) =>
        question.questionId === questionId ? { ...question, questionScore: sanitized } : question,
      ),
    )
    setQuestionsDirty(true)
    setExamActionError(null)
  }

  const handleSaveDraftQuestions = async () => {
    const examId = selectedExamId ?? selectedExam?.id
    if (!examId) return
    try {
      const questionScores = draftQuestions.map((q) => q.questionScore ?? 0)
      const totalScore = sumScores(questionScores)
      if (draftQuestions.length > 0 && !isScoreSumValid(questionScores)) {
        setExamActionError(
          `Los puntajes deben sumar ${TOTAL_EXAM_SCORE} (actualmente ${totalScore.toFixed(2)})`,
        )
        return
      }
      const payload = draftQuestions.map((q, idx) => ({
        ...q,
        examId,
        questionIndex: idx + 1,
      }))
      await saveExamQuestions(payload)
      setQuestionsDirty(false)
      setExamActionError(null)
      await refreshSelectedExam()
    } catch (err) {
      setExamActionError(err instanceof Error ? err.message : "No se pudieron guardar los cambios")
    }
  }

  const handleCancelDraftChanges = () => {
    setDraftQuestions(selectedExamQuestions)
    setQuestionsDirty(false)
    setExamActionError(null)
  }

  const handleDeleteExam = async () => {
    if (!selectedExamId) return
    try {
      await deleteExam(selectedExamId)
      setExamActionError(null)
      setShowDeleteDialog(false)
    } catch (err) {
      setExamActionError(err instanceof Error ? err.message : "No se pudo eliminar el examen")
    }
  }

  const handleSendForReview = async (examId: string) => {
    try {
      await sendExamForReview(examId)
      setExamActionError(null)
      setShowSendForReviewDialog(false)
    } catch (err) {
      setExamActionError(err instanceof Error ? err.message : "No se pudo enviar el examen a revisión")
    }
  }

  const draftQuestionScores = draftQuestions.map((question) => question.questionScore ?? 0)
  const hasDraftQuestions = draftQuestions.length > 0
  const draftScoreTotal = sumScores(draftQuestionScores)
  const isDraftScoreValid = !hasDraftQuestions || isScoreSumValid(draftQuestionScores)

  const isEmpty = !loading && exams.length === 0

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <ExamBankHeader onNewExam={() => {
          setExamActionError(null)
          setShowCreationDialog(true)
        }} />

        <div className="mb-2 flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar exámenes..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleOpenFiltersDialog}>
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive">
            No se pudieron cargar los exámenes: {error.message}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Cargando exámenes...</p>
            ) : isEmpty ? (
              <EmptyState />
            ) : (
              <ExamList
                exams={exams}
                selectedExamId={selectedExamId}
                onSelect={(exam) => {
                  void selectExam(exam.id)
                }}
              />
            )}

            {!isEmpty && !loading && (
              <div className="mt-2 pt-4 border-t flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {exams.length} de {totalItems || exams.length} exámenes.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage(page - 1)}
                    disabled={loading || !canPrevPage}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage(page + 1)}
                    disabled={loading || !canNextPage}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Card className="p-4 space-y-4">
            {!selectedExam && !selectedExamLoading ? (
              <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                <p className="text-sm">Selecciona un examen para ver sus detalles</p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Título</p>
                    <h3 className="text-lg font-semibold">{selectedExam?.title ?? selectedExamListItem?.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {statusLabel ? <Badge>{statusLabel}</Badge> : null}
                      {selectedSubjectName ? <Badge variant="outline">{selectedSubjectName}</Badge> : null}
                      {difficultyLabel ? <Badge variant="secondary">{difficultyLabel}</Badge> : null}
                      <Badge variant="secondary">
                        {selectedExam?.questionCount ?? selectedExamListItem?.questionCount ?? 0} preguntas
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedExamId) void refreshSelectedExam()
                      }}
                      disabled={!selectedExamId || selectedExamLoading}
                    >
                      {selectedExamLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refrescar"}
                    </Button>
                    {(selectedExam?.examStatus === "DRAFT" || selectedExam?.examStatus === "draft") && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setShowSendForReviewDialog(true)}
                        disabled={!selectedExamId || sendingForReview || selectedExamLoading}
                      >
                        Enviar a Revisión
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={!selectedExamId || deletingExam}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>

                {selectedExamError ? (
                  <p className="text-sm text-destructive">No se pudo cargar el examen: {selectedExamError.message}</p>
                ) : null}
                {examActionError ? <p className="text-sm text-destructive">{examActionError}</p> : null}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Autor</p>
                    <p className="font-medium">{selectedExamListItem?.authorLabel || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Validador</p>
                    <p className="font-medium">{selectedExamListItem?.validatorLabel || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Creado</p>
                    <p className="font-medium">{formatDateLabel(selectedExam?.createdAt ?? selectedExamListItem?.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Actualizado</p>
                    <p className="font-medium">{formatDateLabel(selectedExam?.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Validado</p>
                    <p className="font-medium">{formatDateLabel(selectedExam?.validatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Observaciones</p>
                    <p className="font-medium break-words">
                      {selectedExam?.observations ?? "—"}
                    </p>
                  </div>
                </div>

                {selectedExam?.topicProportion ? (
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">Proporción por tema</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedExam.topicProportion).map(([topic, value]) => {
                        const topicName = topicNamesMap.get(topic) ?? topic
                        return (
                          <Badge key={topic} variant="outline">
                            {topicName}: {Math.round(value * 100)}%
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">Preguntas del examen</p>
                    <p className="text-xs text-muted-foreground">
                      Arrastra para reordenar, elimina o agrega nuevas preguntas.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelDraftChanges}
                      disabled={!questionsDirty || savingExam || selectedExamLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowAddQuestionDialog(true)}
                      disabled={!selectedExamId || selectedExamLoading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar pregunta
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => void handleSaveDraftQuestions()}
                      disabled={
                        !questionsDirty || savingExam || selectedExamLoading || !isDraftScoreValid
                      }
                    >
                      Guardar cambios
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 pb-3 text-sm">
                  <span
                    className={`font-medium ${isDraftScoreValid ? "text-muted-foreground" : "text-destructive"
                      }`}
                  >
                    Puntaje total: {draftScoreTotal.toFixed(2)} / {TOTAL_EXAM_SCORE}
                  </span>
                  {!isDraftScoreValid && hasDraftQuestions ? (
                    <span className="text-xs text-destructive">
                      Ajusta los puntajes antes de guardar.
                    </span>
                  ) : null}
                </div>

                {selectedExamLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando examen...
                  </div>
                ) : (
                  <ScrollArea className="max-h-80 pr-2">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => {
                        void handleDragEnd(event)
                      }}
                    >
                      <SortableContext
                        items={draftQuestions.map((question) => question.key)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {draftQuestions.length ? (
                            draftQuestions.map((question, index) => (
                              <SortableExamQuestionRow
                                key={question.key}
                                question={question}
                                index={index}
                                onRemove={(id) => handleRemoveDraftQuestion(id)}
                                onScoreChange={handleDraftQuestionScoreChange}
                                disabled={savingExam || selectedExamLoading}
                                subtopicLabel={
                                  question.detail?.subtopicId
                                    ? subtopicIdToName.get(question.detail.subtopicId)
                                    : undefined
                                }
                                topicLabel={
                                  question.detail?.subtopicId
                                    ? subtopicIdToTopicName.get(question.detail.subtopicId)
                                    : undefined
                                }
                              />
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">Este examen aún no tiene preguntas.</p>
                          )}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </ScrollArea>
                )}

                {savingExam ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando cambios...
                  </div>
                ) : null}
              </>
            )}
          </Card>
        </div>
      </div>

      <ExamFiltersDialog
        open={showFiltersDialog}
        onOpenChange={setShowFiltersDialog}
        filters={tempFilters}
        onFiltersChange={setTempFilters}
        availableAuthors={availableAuthors}
        availableSubjects={subjectOptions}
        availableStatuses={statusOptions}
        availableDifficulties={difficultyOptions}
        onApplyFilters={handleApplyFilters}
      />

      <ExamCreationDialog
        open={showCreationDialog}
        onOpenChange={(open) => {
          setShowCreationDialog(open)
          if (!open) {
            resetManualForm()
            resetAutomaticForm()
          }
        }}
        onSelectManual={() => {
          setShowCreationDialog(false)
          setShowManualDialog(true)
        }}
        onSelectAutomatic={() => {
          setShowCreationDialog(false)
          setShowAutomaticDialog(true)
        }}
      />

      <ManualExamFormDialog
        open={showManualDialog}
        onOpenChange={(open) => {
          setShowManualDialog(open)
          if (!open) {
            resetManualForm()
            setIsAutomaticPreview(false)
          }
        }}
        form={manualForm}
        onFormChange={setManualForm}
        subjects={subjectsForForms}
        availableQuestions={
          manualForm.subject && subtopicsBySubjectId.has(manualForm.subject)
            ? selectableQuestions.filter((question) =>
              (subtopicsBySubjectId.get(manualForm.subject) ?? []).includes(question.subtopic),
            )
            : selectableQuestions
        }
        onSubmit={handleManualSubmit}
        isAutomaticPreview={isAutomaticPreview}
      />

      <AutomaticExamFormDialog
        open={showAutomaticDialog}
        onOpenChange={(open) => {
          setShowAutomaticDialog(open)
          if (!open) {
            resetAutomaticForm()
          }
        }}
        form={automaticForm}
        onFormChange={setAutomaticForm}
        subjects={subjectsForForms}
        onGenerate={() => void handleAutomaticSubmit()}
      />

      <Dialog open={showAddQuestionDialog} onOpenChange={setShowAddQuestionDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Agregar pregunta al examen</DialogTitle>
            <DialogDescription>Filtra por subtópico, tipo o dificultad y añade solo preguntas de tus asignaturas.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[80vh] overflow-hidden flex flex-col min-h-0">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <Label>Subtópico</Label>
                <Select
                  value={questionFilters.subtopic}
                  onValueChange={(value) => setQuestionFilters({ ...questionFilters, subtopic: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {questionSubtopicOptions.map((subtopic) => (
                      <SelectItem key={subtopic} value={subtopic}>
                        {subtopic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Tipo de pregunta</Label>
                <Select
                  value={questionFilters.type}
                  onValueChange={(value) => setQuestionFilters({ ...questionFilters, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {questionTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Dificultad</Label>
                <Select
                  value={questionFilters.difficulty}
                  onValueChange={(value) => setQuestionFilters({ ...questionFilters, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="Fácil">Fácil</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Difícil">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Busca por texto de la pregunta..."
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
              />
              <Button
                variant="ghost"
                onClick={() => {
                  setQuestionFilters({ subtopic: "all", type: "all", difficulty: "all" })
                  setQuestionSearch("")
                  setQuestionPage(1)
                }}
              >
                Limpiar
              </Button>
            </div>

            {questionBankError ? (
              <p className="text-sm text-destructive">No se pudieron cargar las preguntas: {questionBankError.message}</p>
            ) : null}

            <div className="space-y-2">
              {questionsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando preguntas...
                </div>
              ) : availableQuestions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay preguntas disponibles con los filtros seleccionados.
                </p>
              ) : (
                selectableQuestionsForCurrentExam.map((question) => {
                  const alreadyAdded = new Set(draftQuestions.map((q) => q.questionId)).has(question.id)
                  return (
                    <div
                      key={question.id}
                      className="border rounded-lg p-3 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {question.subtopic ? <Badge variant="outline">{question.subtopic}</Badge> : null}
                          <Badge variant="secondary">{question.difficulty}</Badge>
                          {question.type ? <Badge variant="secondary">{question.type}</Badge> : null}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 break-words">{question.body}</p>
                        <p className="text-xs text-muted-foreground">Autor: {question.author}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddQuestion(question)}
                        disabled={savingExam || alreadyAdded || !selectedExamId}
                        variant={alreadyAdded ? "secondary" : "default"}
                      >
                        {alreadyAdded ? "Ya agregada" : "Agregar"}
                      </Button>
                    </div>
                  )
                })
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Página {questionPage} de {questionsTotalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeQuestionPage(questionPage - 1)}
                  disabled={questionsLoading || !canPrevQuestions}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeQuestionPage(questionPage + 1)}
                  disabled={questionsLoading || !canNextQuestions}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar examen</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el examen seleccionado. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void handleDeleteExam()}
              disabled={!selectedExamId || deletingExam}
            >
              {deletingExam ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSendForReviewDialog} onOpenChange={setShowSendForReviewDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar examen a revisión</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de enviar este examen a revisión? El estado del examen cambiará a "Bajo Revisión".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowSendForReviewDialog(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedExamId) void handleSendForReview(selectedExamId)
              }}
              disabled={!selectedExamId || sendingForReview}
            >
              {sendingForReview ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar a Revisión"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
