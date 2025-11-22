"use client"

import { CheckCircle2, RefreshCw, X, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { ScrollArea } from "../../ui/scroll-area"
import { SelectedQuestion, Subject } from "./types"
import { useState } from "react"

interface ExamPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  examName: string
  subject: string
  questions: SelectedQuestion[]
  availableQuestions?: SelectedQuestion[]
  subjectId?: string
  subjects?: Subject[]
  onQuestionsChange?: (questions: SelectedQuestion[]) => void
  onRegenerate: () => void
  onConfirm: () => void
}

export function ExamPreviewDialog({
  open,
  onOpenChange,
  examName,
  subject,
  questions,
  availableQuestions = [],
  onQuestionsChange,
  onRegenerate,
  onConfirm
}: ExamPreviewDialogProps) {
  const [showQuestionSelector, setShowQuestionSelector] = useState(false)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil":
        return "bg-green-100 text-green-700 hover:bg-green-100"
      case "Regular":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
      case "Difícil":
        return "bg-red-100 text-red-700 hover:bg-red-100"
      case "Mixta":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100"
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100"
    }
  }

  const removeQuestion = (questionId: string) => {
    if (onQuestionsChange) {
      onQuestionsChange(questions.filter(q => q.id !== questionId))
    }
  }

  const addQuestion = (question: SelectedQuestion) => {
    if (onQuestionsChange && !questions.find(q => q.id === question.id)) {
      onQuestionsChange([...questions, question])
      setShowQuestionSelector(false)
    }
  }

  const availableToAdd = availableQuestions.filter(
    aq => !questions.find(q => q.id === aq.id)
  )

  // Calcular estadísticas del examen
  const questionsByType = questions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const questionsByDifficulty = questions.reduce((acc, q) => {
    acc[q.difficulty] = (acc[q.difficulty] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Vista Previa del Examen</DialogTitle>
          <DialogDescription>
            Revisa el examen generado antes de guardarlo
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 overflow-y-auto pr-2">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium mb-1">{examName}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{subject}</Badge>
                  <Badge variant="secondary">
                    {questions.length} pregunta{questions.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={onRegenerate}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerar
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h4 className="text-sm font-medium mb-2">Distribución por Tipo</h4>
                <div className="space-y-1">
                  {Object.entries(questionsByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{type}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Distribución por Dificultad</h4>
                <div className="space-y-1">
                  {Object.entries(questionsByDifficulty).map(([diff, count]) => (
                    <div key={diff} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{diff}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-medium mb-4">Preguntas del Examen</h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-medium text-sm mt-1">{index + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {question.subtopic}
                          </Badge>
                          <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {question.type}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2 break-words">{question.body}</p>
                        {question.options && question.options.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="text-sm text-muted-foreground pl-4">
                                {optIndex + 1}. {option}
                              </div>
                            ))}
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => removeQuestion(question.id)}
                        >
                          <X className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {showQuestionSelector && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Agregar Pregunta</h4>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-3 pr-4">
                        {availableToAdd.map((question, index) => (
                          <div
                            key={question.id}
                            className="p-4 border rounded-lg"
                          >
                            <div className="flex items-start gap-3">
                              <span className="font-medium text-sm mt-1">{index + 1}.</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs">
                                    {question.subtopic}
                                  </Badge>
                                  <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                                    {question.difficulty}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {question.type}
                                  </Badge>
                                </div>
                                <p className="text-sm mb-2 break-words">{question.body}</p>
                                {question.options && question.options.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {question.options.map((option, optIndex) => (
                                      <div key={optIndex} className="text-sm text-muted-foreground pl-4">
                                        {optIndex + 1}. {option}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => addQuestion(question)}
                                >
                                  <Plus className="h-4 w-4" />
                                  Agregar
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
                {!showQuestionSelector && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setShowQuestionSelector(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Pregunta
                  </Button>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Confirmar y Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}