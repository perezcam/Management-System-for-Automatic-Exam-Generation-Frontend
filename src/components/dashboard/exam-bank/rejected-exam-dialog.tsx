import { AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { ScrollArea } from "../../ui/scroll-area"
import { Exam } from "./types"

interface RejectedExamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exam: Exam | null
}

function getDifficultyColor(difficulty: string) {
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

export function RejectedExamDialog({ open, onOpenChange, exam }: RejectedExamDialogProps) {
  if (!exam || exam.status !== "Rechazado") return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Examen Rechazado</DialogTitle>
          <DialogDescription>
            Revisa los comentarios de revisión y el contenido del examen
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4 overflow-y-auto pr-2">
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1 space-y-2">
                <h3 className="font-medium text-red-900">Comentarios de Revisión</h3>
                <p className="text-sm text-red-800">
                  {exam.reviewComment || "No hay comentarios disponibles"}
                </p>
                <div className="text-sm text-red-700">
                  <span className="font-medium">Revisado por:</span> {exam.reviewedBy || "N/A"}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-3">
              <h3 className="font-medium">{exam.name}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{exam.subject}</Badge>
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                  Rechazado
                </Badge>
                <Badge variant="secondary">
                  {exam.totalQuestions} pregunta{exam.totalQuestions !== 1 ? "s" : ""}
                </Badge>
                <Badge variant="secondary">
                  {exam.type === "manual" ? "Manual" : "Automático"}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Creado por:</span> {exam.createdBy}
                <span className="mx-2">•</span>
                <span>{exam.createdAt}</span>
                <span className="mx-2">•</span>
                <span className="font-medium">Validador:</span> {exam.validator}
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <h4 className="font-medium">Preguntas del Examen</h4>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {exam.questions?.map((question, index) => (
                  <Card key={question.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="font-medium">{index + 1}.</span>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
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
                        <p className="text-sm">{question.body}</p>
                        {question.options && question.options.length > 0 && (
                          <ul className="space-y-1 pl-4">
                            {question.options.map((option, i) => (
                              <li key={i} className="text-sm text-muted-foreground">
                                • {option}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
