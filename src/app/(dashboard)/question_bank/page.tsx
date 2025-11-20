"use client"

import { useMemo, useState } from "react"
import { QuestionBankHeader } from "@/components/dashboard/question-bank/question-bank-header"
import { QuestionFilters } from "@/components/dashboard/question-bank/question-filters"
import { EmptyState } from "@/components/dashboard/question-bank/empty-state"
import { QuestionList } from "@/components/dashboard/question-bank/question-list"
import { QuestionFormDialog } from "@/components/dashboard/question-bank/question-form-dialog"
import { DeleteQuestionDialog } from "@/components/dashboard/question-bank/delete-question-dialog"
import type { QuestionListItem } from "@/types/question-bank/view"
import { useQuestionBank } from "@/hooks/questions/use-question-bank"
import { DifficultyLevelEnum } from "@/types/question-bank/enums/difficultyLevel"

const DIFFICULTY_TO_ENUM: Record<QuestionListItem["difficulty"], DifficultyLevelEnum> = {
  "Fácil": DifficultyLevelEnum.EASY,
  "Regular": DifficultyLevelEnum.MEDIUM,
  "Difícil": DifficultyLevelEnum.HARD,
}

export default function BancoPreguntasView() {
  const {
    questions,
    loading,
    filters,
    setFilters,
    search,
    setSearch,
    uniqueSubtopicNames,
    uniqueQuestionTypeNames,
    allSubtopics,
    questionTypes,
    create,
    update,
    remove,
  } = useQuestionBank()

  const [showNewQuestionDialog, setShowNewQuestionDialog] = useState(false)
  const [showEditQuestionDialog, setShowEditQuestionDialog] = useState(false)
  const [showDeleteQuestionDialog, setShowDeleteQuestionDialog] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionListItem | null>(null)
  const [newQuestion, setNewQuestion] = useState<Partial<QuestionListItem>>({
    subtopic: "",
    difficulty: "Regular",
    body: "",
    type: "",
    expectedAnswer: "",
    options: []
  })
  const [editQuestion, setEditQuestion] = useState<Partial<QuestionListItem>>({
    subtopic: "",
    difficulty: "Regular",
    body: "",
    type: "",
    expectedAnswer: "",
    options: []
  })
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>([])
  const [editQuestionOptions, setEditQuestionOptions] = useState<string[]>([])
  
  const allSubtopicNames = useMemo(() => allSubtopics.map(subtopic => subtopic.name), [allSubtopics])

  const resetNewQuestionState = () => {
    setNewQuestion({
      subtopic: "",
      difficulty: "Regular",
      body: "",
      type: "",
      expectedAnswer: "",
      options: []
    })
    setNewQuestionOptions([])
  }

  const resetEditQuestionState = () => {
    setEditQuestion({
      subtopic: "",
      difficulty: "Regular",
      body: "",
      type: "",
      expectedAnswer: "",
      options: []
    })
    setEditQuestionOptions([])
  }

  const handleCreateQuestion = async () => {
    if (!newQuestion.subtopic || !newQuestion.body || !newQuestion.type) {
      return
    }
    const subtopicId = allSubtopics.find((subtopic) => subtopic.name === newQuestion.subtopic)?.id
    const questionTypeId = questionTypes.find((type) => type.name === newQuestion.type)?.id
    if (!subtopicId || !questionTypeId) {
      return
    }
    const difficulty = newQuestion.difficulty ? DIFFICULTY_TO_ENUM[newQuestion.difficulty] : DifficultyLevelEnum.MEDIUM
    const expectedResponse = newQuestion.expectedAnswer ?? ""
    const optionsPayload =
      newQuestionOptions.length > 0
        ? newQuestionOptions.map((text) => ({
            text,
            isCorrect: expectedResponse ? text.trim().toLowerCase() === expectedResponse.trim().toLowerCase() : false,
          }))
        : null

    await create({
      subtopicId,
      questionTypeId,
      body: newQuestion.body,
      response: expectedResponse || null,
      difficulty,
      options: optionsPayload,
    })

    resetNewQuestionState()
    setShowNewQuestionDialog(false)
  }

  const openEditDialog = (question: QuestionListItem) => {
    setSelectedQuestion(question)
    setEditQuestion({
      subtopic: question.subtopic,
      difficulty: question.difficulty,
      body: question.body,
      type: question.type,
      expectedAnswer: question.expectedAnswer,
      options: question.options
    })
    setEditQuestionOptions(question.options || [])
    setShowEditQuestionDialog(true)
  }

  const handleEditQuestion = async () => {
    if (!selectedQuestion || !editQuestion.subtopic || !editQuestion.body || !editQuestion.type) {
      return
    }
    const subtopicId = allSubtopics.find((subtopic) => subtopic.name === editQuestion.subtopic)?.id
    const questionTypeId = questionTypes.find((type) => type.name === editQuestion.type)?.id
    if (!subtopicId || !questionTypeId) {
      return
    }
    const difficulty = editQuestion.difficulty ? DIFFICULTY_TO_ENUM[editQuestion.difficulty] : DifficultyLevelEnum.MEDIUM
    const expectedResponse = editQuestion.expectedAnswer ?? ""
    const optionsPayload =
      editQuestionOptions.length > 0
        ? editQuestionOptions.map((text) => ({
            text,
            isCorrect: expectedResponse ? text.trim().toLowerCase() === expectedResponse.trim().toLowerCase() : false,
          }))
        : null

    await update(selectedQuestion.id, {
      subtopicId,
      questionTypeId,
      body: editQuestion.body,
      response: expectedResponse || null,
      difficulty,
      options: optionsPayload,
    })

    setShowEditQuestionDialog(false)
    setSelectedQuestion(null)
    resetEditQuestionState()
  }

  const openDeleteDialog = (question: QuestionListItem) => {
    setSelectedQuestion(question)
    setShowDeleteQuestionDialog(true)
  }

  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) {
      return
    }
    await remove(selectedQuestion.id)
    setShowDeleteQuestionDialog(false)
    setSelectedQuestion(null)
  }

  // Filtrar preguntas
  const filteredQuestions = questions.filter((question) => {
    if (filters.subtopic && filters.subtopic !== "all" && question.subtopic !== filters.subtopic) {
      return false
    }
    if (filters.type && filters.type !== "all" && question.type !== filters.type) {
      return false
    }
    if (filters.difficulty && filters.difficulty !== "all" && question.difficulty !== filters.difficulty) {
      return false
    }
    return true
  })

  // Obtener valores únicos para los filtros
  const uniqueSubtopics = uniqueSubtopicNames.length ? uniqueSubtopicNames : Array.from(new Set(questions.map(q => q.subtopic)))
  const uniqueTypes = uniqueQuestionTypeNames.length ? uniqueQuestionTypeNames : Array.from(new Set(questions.map(q => q.type)))
  const isEmpty = !loading && filteredQuestions.length === 0

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <QuestionBankHeader onNewQuestion={() => setShowNewQuestionDialog(true)} />

        <QuestionFilters
          filters={filters}
          onFiltersChange={setFilters}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          uniqueSubtopics={uniqueSubtopics}
          uniqueTypes={uniqueTypes}
          searchValue={search}
          onSearchChange={setSearch}
        />

        {isEmpty ? (
          <EmptyState />
        ) : (
          <QuestionList
            questions={filteredQuestions}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
          />
        )}
      </div>

      <QuestionFormDialog
        open={showNewQuestionDialog}
        onOpenChange={setShowNewQuestionDialog}
        mode="create"
        question={newQuestion}
        onQuestionChange={setNewQuestion}
        options={newQuestionOptions}
        onOptionsChange={setNewQuestionOptions}
        questionTypes={questionTypes}
        allSubtopics={allSubtopicNames}
        onSubmit={handleCreateQuestion}
      />

      <QuestionFormDialog
        open={showEditQuestionDialog}
        onOpenChange={setShowEditQuestionDialog}
        mode="edit"
        question={editQuestion}
        onQuestionChange={setEditQuestion}
        options={editQuestionOptions}
        onOptionsChange={setEditQuestionOptions}
        questionTypes={questionTypes}
        allSubtopics={allSubtopicNames}
        onSubmit={handleEditQuestion}
      />

      <DeleteQuestionDialog
        open={showDeleteQuestionDialog}
        onOpenChange={setShowDeleteQuestionDialog}
        onConfirm={handleDeleteQuestion}
      />
    </div>
  )
}
