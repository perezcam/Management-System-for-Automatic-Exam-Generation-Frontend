export type QuestionType = {
  id: string
  name: string
}

export type Topic = {
  id: string
  name: string
  subtopics: string[]
}

export type Question = {
  id: string
  subtopic: string
  difficulty: "Fácil" | "Regular" | "Difícil"
  body: string
  type: string
  expectedAnswer: string
  author: string
  options?: string[]
}
