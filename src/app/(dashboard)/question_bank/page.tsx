"use client"

import { useState } from "react"
import { QuestionBankHeader } from "@/components/dashboard/question-bank/question-bank-header"
import { QuestionFilters, type Filters } from "@/components/dashboard/question-bank/question-filters"
import { EmptyState } from "@/components/dashboard/question-bank/empty-state"
import { QuestionList } from "@/components/dashboard/question-bank/question-list"
import { QuestionFormDialog } from "@/components/dashboard/question-bank/question-form-dialog"
import { DeleteQuestionDialog } from "@/components/dashboard/question-bank/delete-question-dialog"
import { Question, QuestionType, Topic } from "@/components/dashboard/question-bank/types"

export default function BancoPreguntasView() {
  const [questionTypes] = useState<QuestionType[]>([
    { id: "1", name: "Ensayo" },
    { id: "2", name: "Opción Múltiple" },
    { id: "3", name: "Verdadero/Falso" }
  ])
  const [topics] = useState<Topic[]>([
    { id: "1", name: "Algoritmos", subtopics: ["Ordenamiento", "Búsqueda", "Recursión"] },
    { id: "2", name: "Estructuras de Datos", subtopics: ["Listas", "Árboles", "Grafos"] }
  ])
  const [questions, setQuestions] = useState<Question[]>([])
  const [showNewQuestionDialog, setShowNewQuestionDialog] = useState(false)
  const [showEditQuestionDialog, setShowEditQuestionDialog] = useState(false)
  const [showDeleteQuestionDialog, setShowDeleteQuestionDialog] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    subtopic: "",
    difficulty: "Regular",
    body: "",
    type: "",
    expectedAnswer: "",
    options: []
  })
  const [editQuestion, setEditQuestion] = useState<Partial<Question>>({
    subtopic: "",
    difficulty: "Regular",
    body: "",
    type: "",
    expectedAnswer: "",
    options: []
  })
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>([])
  const [editQuestionOptions, setEditQuestionOptions] = useState<string[]>([])
  const [filters, setFilters] = useState<Filters>({
    subtopic: "all",
    type: "all",
    difficulty: "all"
  })
  
  // Obtener todos los subtópicos de todos los tópicos
  const allSubtopics = topics.flatMap(topic => topic.subtopics)

  const handleCreateQuestion = () => {
    if (newQuestion.subtopic && newQuestion.body && newQuestion.type && newQuestion.expectedAnswer) {
      const question: Question = {
        id: String(Date.now()),
        subtopic: newQuestion.subtopic,
        difficulty: newQuestion.difficulty as "Fácil" | "Regular" | "Difícil",
        body: newQuestion.body,
        type: newQuestion.type,
        expectedAnswer: newQuestion.expectedAnswer,
        author: "Mauricio Medina Hernández",
        options: newQuestion.options
      }
      setQuestions([...questions, question])
      setNewQuestion({
        subtopic: "",
        difficulty: "Regular",
        body: "",
        type: "",
        expectedAnswer: "",
        options: []
      })
      setNewQuestionOptions([])
      setShowNewQuestionDialog(false)
    }
  }

  const openEditDialog = (question: Question) => {
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

  const handleEditQuestion = () => {
    if (selectedQuestion && editQuestion.subtopic && editQuestion.body && editQuestion.type && editQuestion.expectedAnswer) {
      setQuestions(questions.map(q => 
        q.id === selectedQuestion.id 
          ? { 
              ...q, 
              subtopic: editQuestion.subtopic!,
              difficulty: editQuestion.difficulty as "Fácil" | "Regular" | "Difícil",
              body: editQuestion.body!,
              type: editQuestion.type!,
              expectedAnswer: editQuestion.expectedAnswer!,
              options: editQuestion.options
            }
          : q
      ))
      setShowEditQuestionDialog(false)
      setSelectedQuestion(null)
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
  }

  const openDeleteDialog = (question: Question) => {
    setSelectedQuestion(question)
    setShowDeleteQuestionDialog(true)
  }

  const handleDeleteQuestion = () => {
    if (selectedQuestion) {
      setQuestions(questions.filter(q => q.id !== selectedQuestion.id))
      setShowDeleteQuestionDialog(false)
      setSelectedQuestion(null)
    }
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
  const uniqueSubtopics = Array.from(new Set(questions.map(q => q.subtopic)))
  const uniqueTypes = Array.from(new Set(questions.map(q => q.type)))

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
        />

        {questions.length === 0 ? (
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
        allSubtopics={allSubtopics}
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
        allSubtopics={allSubtopics}
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
