import { Card } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { Plus } from "lucide-react"
import { useState } from "react"

export type QuestionType = {
  id: string
  name: string
}

interface QuestionTypeFormProps {
  onCreateType: (type: QuestionType) => void
}

export function QuestionTypeForm({ onCreateType }: QuestionTypeFormProps) {
  const [newTypeName, setNewTypeName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTypeName.trim()) {
      onCreateType({ id: String(Date.now()), name: newTypeName })
      setNewTypeName("")
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
        <Button type="submit" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Crear Tipo
        </Button>
      </form>
    </Card>
  )
}
