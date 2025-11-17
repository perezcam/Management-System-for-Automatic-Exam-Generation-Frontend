import { Edit2, Trash2 } from "lucide-react"
import { Card } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Question } from "./types"

interface QuestionListProps {
  questions: Question[]
  onEdit: (question: Question) => void
  onDelete: (question: Question) => void
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "Fácil":
      return "bg-green-100 text-green-700 hover:bg-green-100"
    case "Regular":
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
    case "Difícil":
      return "bg-red-100 text-red-700 hover:bg-red-100"
    default:
      return "bg-gray-100 text-gray-700 hover:bg-gray-100"
  }
}

export function QuestionList({ questions, onEdit, onDelete }: QuestionListProps) {
  return (
    <Card className="p-6">
      <div className="space-y-3">
        {questions.map((question) => (
          <div
            key={question.id}
            className="p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline">{question.subtopic}</Badge>
                  <Badge className={getDifficultyColor(question.difficulty)}>
                    {question.difficulty}
                  </Badge>
                  <Badge variant="secondary">{question.type}</Badge>
                </div>
                <p className="mb-2 break-words">{question.body}</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Autor:</span> {question.author}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => onEdit(question)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(question)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
