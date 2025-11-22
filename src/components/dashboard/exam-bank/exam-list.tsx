import { Edit2, Trash2, FileText, Calendar, Send } from "lucide-react"
import { Card } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Exam } from "./types"

interface ExamListProps {
  exams: Exam[]
  onView: (exam: Exam) => void
  onEdit: (exam: Exam) => void
  onDelete: (exam: Exam) => void
  onSchedule: (exam: Exam) => void
  onSendToReview?: (exam: Exam) => void
}

function getStatusColor(status: string) {
  switch (status) {
    case "Aprobado":
      return "bg-green-100 text-green-700 hover:bg-green-100"
    case "Bajo Revisión":
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
    case "Rechazado":
      return "bg-red-100 text-red-700 hover:bg-red-100"
    case "Borrador":
      return "bg-gray-100 text-gray-700 hover:bg-gray-100"
    default:
      return "bg-gray-100 text-gray-700 hover:bg-gray-100"
  }
}

export function ExamList({ exams, onView, onEdit, onDelete, onSchedule, onSendToReview }: ExamListProps) {
  return (
    <Card className="p-6">
      <div className="space-y-3">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="border rounded-lg"
          >
            <div
              className="p-4 hover:bg-accent transition-colors cursor-pointer"
              onClick={() => onView(exam)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">{exam.name}</h3>
                    <Badge className={getStatusColor(exam.status)}>
                      {exam.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="outline">{exam.subject}</Badge>
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
                    {exam.validator && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="font-medium">Validador:</span> {exam.validator}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" onClick={() => onView(exam)} title="Ver examen">
                    <FileText className="h-4 w-4" />
                  </Button>
                  {exam.type === "manual" && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(exam)} title="Editar examen">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => onDelete(exam)} title="Eliminar examen">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  {exam.status === "Aprobado" && (
                    <Button variant="default" size="sm" onClick={() => onSchedule(exam)} title="Programar examen">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  )}
                  {exam.status === "Borrador" && (
                    <Button variant="default" size="sm" onClick={() => onSendToReview?.(exam)} title="Enviar a revisión">
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Vista previa automática para exámenes aprobados */}
            {/* Removed preview section */}
          </div>
        ))}
      </div>
    </Card>
  )
}