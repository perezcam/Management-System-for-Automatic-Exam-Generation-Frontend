import { Plus, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Textarea } from "../../ui/textarea"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import type { QuestionListItem, QuestionTypeOption } from "@/types/question-bank/view"

interface QuestionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  question: Partial<QuestionListItem>
  onQuestionChange: (question: Partial<QuestionListItem>) => void
  options: string[]
  onOptionsChange: (options: string[]) => void
  questionTypes: QuestionTypeOption[]
  allSubtopics: string[]
  onSubmit: () => void
}

export function QuestionFormDialog({
  open,
  onOpenChange,
  mode,
  question,
  onQuestionChange,
  options,
  onOptionsChange,
  questionTypes,
  allSubtopics,
  onSubmit
}: QuestionFormDialogProps) {
  const handleTypeChange = (value: string) => {
    onQuestionChange({ ...question, type: value })
    // Inicializar opciones para Verdadero/Falso
    if (value === "Verdadero/Falso") {
      onOptionsChange(["Verdadero", "Falso"])
    } else if (value !== "Opción Múltiple") {
      onOptionsChange([])
    }
  }

  const addOption = () => {
    onOptionsChange([...options, ""])
  }

  const removeOption = (index: number) => {
    const newOptions = [...options]
    newOptions.splice(index, 1)
    onOptionsChange(newOptions)
    onQuestionChange({ ...question, options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    onOptionsChange(newOptions)
    onQuestionChange({ ...question, options: newOptions })
  }

  const isMultipleChoiceOrTrueFalse = question.type === "Opción Múltiple" || question.type === "Verdadero/Falso"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nueva Pregunta" : "Editar Pregunta"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Crea una nueva pregunta para el banco" : "Modifica los datos de la pregunta"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subtopic">Subtópico</Label>
              <Select
                value={question.subtopic}
                onValueChange={(value) => onQuestionChange({ ...question, subtopic: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un subtópico" />
                </SelectTrigger>
                <SelectContent>
                  {allSubtopics.map((subtopic) => (
                    <SelectItem key={subtopic} value={subtopic}>
                      {subtopic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Dificultad</Label>
              <Select
                value={question.difficulty}
                onValueChange={(value) => onQuestionChange({ ...question, difficulty: value as "Fácil" | "Regular" | "Difícil" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fácil">Fácil</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Difícil">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Pregunta</Label>
            <Select
              value={question.type}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {questionTypes.map((type) => (
                  <SelectItem key={type.id} value={type.name}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isMultipleChoiceOrTrueFalse ? (
            <div className="space-y-2">
              <Label>Opciones</Label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm font-medium w-6">{index + 1}.</span>
                    <Input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Opción ${index + 1}`}
                      className="flex-1"
                      disabled={question.type === "Verdadero/Falso"}
                    />
                    {question.type !== "Verdadero/Falso" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                {question.type === "Opción Múltiple" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Opción
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="body">Cuerpo de la Pregunta</Label>
              <Textarea
                id="body"
                value={question.body}
                onChange={(e) => onQuestionChange({ ...question, body: e.target.value })}
                placeholder="Escribe aquí la pregunta..."
                className="resize-none"
                rows={4}
              />
            </div>
          )}
          {isMultipleChoiceOrTrueFalse && (
            <div className="space-y-2">
              <Label htmlFor="body">Enunciado de la Pregunta</Label>
              <Textarea
                id="body"
                value={question.body}
                onChange={(e) => onQuestionChange({ ...question, body: e.target.value })}
                placeholder="Escribe aquí el enunciado de la pregunta..."
                className="resize-none"
                rows={3}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="expectedAnswer">Respuesta Esperada</Label>
            <Textarea
              id="expectedAnswer"
              value={question.expectedAnswer}
              onChange={(e) => onQuestionChange({ ...question, expectedAnswer: e.target.value })}
              placeholder="Describe la respuesta esperada..."
              className="resize-none"
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit}>
            {mode === "create" ? "Crear Pregunta" : "Guardar Cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
