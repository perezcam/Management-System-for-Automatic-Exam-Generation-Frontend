import { Edit2, Trash2 } from "lucide-react"
import { Card } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import type { QuestionListItem } from "@/types/question-bank/view"

interface QuestionListProps {
  questions: QuestionListItem[]
  onEdit: (question: QuestionListItem) => void
  onDelete: (question: QuestionListItem) => void
}

function getDifficultyStyle(difficulty: string): React.CSSProperties {
  switch (difficulty) {
    case "Fácil":
      return { backgroundColor: "#dcfce7", color: "#15803d" }; // green-100 / green-700
    case "Regular":
      return { backgroundColor: "#fef9c3", color: "#a16207" }; // yellow-100 / yellow-700
    case "Difícil":
      return { backgroundColor: "#fee2e2", color: "#b91c1c" }; // red-100 / red-700
    default:
      return { backgroundColor: "#f3f4f6", color: "#374151" }; // gray-100 / gray-700
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
                  {question.subtopic ? <Badge variant="outline">{question.subtopic}</Badge> : null}
                  <Badge style={getDifficultyStyle(question.difficulty)}>
                    {question.difficulty}
                  </Badge>

                  {question.type ? <Badge variant="secondary">{question.type}</Badge> : null}
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
