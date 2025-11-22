import { Plus } from "lucide-react"
import { Button } from "../../ui/button"

interface ExamBankHeaderProps {
  onNewExam: () => void
}

export function ExamBankHeader({ onNewExam }: ExamBankHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl mb-2">Banco de Exámenes</h1>
        <p className="text-muted-foreground">
          Repositorio de exámenes creados y aprobados
        </p>
      </div>
      <Button onClick={onNewExam}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Examen
      </Button>
    </div>
  )
}
