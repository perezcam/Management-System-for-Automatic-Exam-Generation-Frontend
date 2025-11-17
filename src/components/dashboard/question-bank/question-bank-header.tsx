import { Plus } from "lucide-react"
import { Button } from "../../ui/button"

interface QuestionBankHeaderProps {
  onNewQuestion: () => void
}

export function QuestionBankHeader({ onNewQuestion }: QuestionBankHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl mb-2">Banco de Preguntas</h1>
        <p className="text-muted-foreground">
          Gestiona y organiza preguntas para tus exámenes
        </p>
      </div>
      <Button onClick={onNewQuestion}>
        <Plus className="mr-2 h-4 w-4" />
        Nueva Pregunta
      </Button>
    </div>
  )
}
