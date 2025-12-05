import { Plus, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Textarea } from "../../ui/textarea"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Checkbox } from "../../ui/checkbox"
import type { QuestionListItem, QuestionTypeOption } from "@/types/question-bank/view"

type OptionInput = {
  text: string
  isCorrect: boolean
}

interface QuestionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  question: Partial<QuestionListItem>
  onQuestionChange: (question: Partial<QuestionListItem>) => void
  options: OptionInput[]
  onOptionsChange: (options: OptionInput[]) => void
  questionTypes: QuestionTypeOption[]
  availableSubtopics: string[]
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
  availableSubtopics,
  onSubmit
}: QuestionFormDialogProps) {
  const handleTypeChange = (value: string) => {
    const baseQuestion = { ...question, type: value, expectedAnswer: "" }
    onQuestionChange(baseQuestion)
    // Inicializar opciones para Verdadero/Falso o limpiar para otros tipos
    if (value === "TRUE_FALSE") {
      onOptionsChange([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ])
    } else if (value !== "MCQ") {
      onOptionsChange([])
    } else {
      onOptionsChange(options.length ? options : [{ text: "", isCorrect: false }])
    }
  }

  const addOption = () => {
    onOptionsChange([...options, { text: "", isCorrect: false }])
  }

  const removeOption = (index: number) => {
    const newOptions = [...options]
    newOptions.splice(index, 1)
    onOptionsChange(newOptions)
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], text: value }
    onOptionsChange(newOptions)
  }

  const toggleOptionCorrect = (index: number) => {
    const newOptions = options.map((option, idx) =>
      idx === index ? { ...option, isCorrect: !option.isCorrect } : option,
    )
    onOptionsChange(newOptions)
  }

  const isMultipleChoiceOrTrueFalse = question.type === "MCQ" || question.type === "TRUE_FALSE"

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
                  {availableSubtopics.map((subtopic, index) => (
                    <SelectItem key={`${subtopic}-${index}`} value={subtopic}>
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
          {isMultipleChoiceOrTrueFalse && (
            <div className="space-y-2">
              <Label>Opciones</Label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm font-medium w-6">{index + 1}.</span>
                    <Input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Opción ${index + 1}`}
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={option.isCorrect}
                        onCheckedChange={() => toggleOptionCorrect(index)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {question.type === "TRUE_FALSE" ? "Verdadero" : "Correcta"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {(question.type == "MCQ" || question.type === "TRUE_FALSE") && (
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
          )}
          <div className="space-y-2">
            <Label htmlFor="body">{isMultipleChoiceOrTrueFalse ? "Enunciado de la Pregunta" : "Cuerpo de la Pregunta"}</Label>
            <Textarea
              id="body"
              value={question.body}
              onChange={(e) => onQuestionChange({ ...question, body: e.target.value })}
              placeholder="Escribe aquí el enunciado de la pregunta..."
              className="resize-none"
              rows={isMultipleChoiceOrTrueFalse ? 3 : 4}
            />
          </div>
          {!isMultipleChoiceOrTrueFalse && (
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
          )}
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
