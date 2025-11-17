import { Card } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { Plus } from "lucide-react"
import { useState } from "react"
import { CreateQuestionTypePayload } from "@/types/question-administration/question-type"

interface QuestionTypeFormProps {
  onCreateType: (payload: CreateQuestionTypePayload) => Promise<void> | void
}

export function QuestionTypeForm({ onCreateType }: QuestionTypeFormProps) {
  const [newTypeName, setNewTypeName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTypeName.trim() || submitting) return

    try {
      setSubmitting(true)
      await onCreateType({ question_type_name: newTypeName.trim() })
      setNewTypeName("")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Plus className="h-5 w-5" />
        <h2 className="text-lg">Registrar Nuevo Tipo de Pregunta</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type-name">Nombre del Tipo</Label>
          <Input
            id="type-name"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            placeholder="Ingrese nombre del tipo"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          <Plus className="h-4 w-4 mr-2" />
          {submitting ? "Creando..." : "Crear Tipo"}
        </Button>
      </form>
    </Card>
  )
}
