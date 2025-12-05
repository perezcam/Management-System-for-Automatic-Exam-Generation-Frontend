export type ExamType = "manual" | "automatic"

export type QuestionType = "Ensayo" | "Opción Múltiple" | "Verdadero/Falso"

export type ExamStatus = "Borrador" | "Bajo Revisión" | "Aprobado" | "Rechazado"

export type Exam = {
  id: string
  name: string
  subject: string
  totalQuestions: number
  type: ExamType
  createdBy: string
  createdAt: string
  questions?: SelectedQuestion[]
  validator?: string
  status: ExamStatus
  reviewComment?: string
  reviewedBy?: string
}

export type SelectedQuestion = {
  id: string
  topic: string
  subtopic: string
  difficulty: "Fácil" | "Regular" | "Difícil"
  type: string
  body: string
  options?: string[]
  score?: number
}

// Payload para actualizar un examen (reordenar/agregar/quitar preguntas)
export type ExamUpdatePayload = {
  questions: Array<{ questionId: string; questionIndex: number }>
}

export type Subject = {
  id: string
  name: string
  topics: Topic[]
}

export type Topic = {
  id: string
  name: string
  subtopics: string[]
}

export type DifficultyDistribution = {
  difficulty: "Fácil" | "Regular" | "Difícil"
  count: number
}

export type QuestionTypeDistribution = {
  type: QuestionType
  count: number
}

export type TopicDistribution = {
  topicId: string
  topicName: string
  count: number
}

export type SubtopicDistribution = {
  subtopic: string
  count: number
}

export type ManualExamForm = {
  name: string
  subject: string
  selectedQuestions: SelectedQuestion[]
}

export type AutomaticExamForm = {
  name: string
  subject: string
  totalQuestions: number
  questionTypeDistribution: QuestionTypeDistribution[]
  difficultyDistribution: DifficultyDistribution[]
  topicCoverage: string[] // subtopics seleccionados
  subtopicDistribution: SubtopicDistribution[] // distribución de preguntas por subtópico
}
