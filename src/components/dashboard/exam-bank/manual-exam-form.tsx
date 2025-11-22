"use client"

import { useState } from "react"
import { Plus, X, GripVertical } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { ScrollArea } from "../../ui/scroll-area"
import { ManualExamForm, Subject, SelectedQuestion } from "./types"

interface ManualExamFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: ManualExamForm
  onFormChange: (form: ManualExamForm) => void
  subjects: Subject[]
  availableQuestions: SelectedQuestion[]
  onSubmit: () => void
  isEditMode?: boolean
}

interface SortableQuestionItemProps {
  question: SelectedQuestion
  index: number
  onRemove: (questionId: string) => void
  getDifficultyColor: (difficulty: string) => string
}

function SortableQuestionItem({ question, index, onRemove, getDifficultyColor }: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="p-3 border rounded-lg flex items-start gap-3 bg-background"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing mt-1"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <span className="font-medium text-sm mt-1">{index + 1}.</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Badge variant="outline" className="text-xs">{question.subtopic}</Badge>
          <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </Badge>
          <Badge variant="secondary" className="text-xs">{question.type}</Badge>
        </div>
        <p className="text-sm break-words">{question.body}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(question.id)}
      >
        <X className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  )
}

export function ManualExamFormDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  subjects,
  availableQuestions,
  onSubmit,
  isEditMode
}: ManualExamFormDialogProps) {
  const [showQuestionSelector, setShowQuestionSelector] = useState(false)
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const selectedSubject = subjects.find(s => s.id === form.subject)
  const allSubtopics = selectedSubject?.topics.flatMap(t => t.subtopics) || []

  // Filtrar preguntas disponibles
  const filteredQuestions = availableQuestions.filter(q => {
    if (selectedSubtopic !== "all" && q.subtopic !== selectedSubtopic) return false
    if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty) return false
    // No mostrar preguntas ya seleccionadas
    if (form.selectedQuestions.find(sq => sq.id === q.id)) return false
    return true
  })

  const addQuestion = (question: SelectedQuestion) => {
    onFormChange({
      ...form,
      selectedQuestions: [...form.selectedQuestions, question]
    })
  }

  const removeQuestion = (questionId: string) => {
    onFormChange({
      ...form,
      selectedQuestions: form.selectedQuestions.filter(q => q.id !== questionId)
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = form.selectedQuestions.findIndex(q => q.id === active.id)
      const newIndex = form.selectedQuestions.findIndex(q => q.id === over.id)

      onFormChange({
        ...form,
        selectedQuestions: arrayMove(form.selectedQuestions, oldIndex, newIndex)
      })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Examen Manual" : "Crear Examen Manual"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Modifica las preguntas y datos del examen. Arrastra las preguntas para reordenarlas." : "Selecciona manualmente las preguntas para tu examen. Arrastra para reordenar."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 overflow-y-auto pr-2">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Examen</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => onFormChange({ ...form, name: e.target.value })}
                placeholder="Ej: Parcial 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Asignatura</Label>
              <Select
                value={form.subject}
                onValueChange={(value) => onFormChange({ ...form, subject: value, selectedQuestions: [] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una asignatura" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Preguntas Seleccionadas ({form.selectedQuestions.length})
              </Label>
              {form.subject && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuestionSelector(!showQuestionSelector)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Pregunta
                </Button>
              )}
            </div>

            {form.selectedQuestions.length > 0 ? (
              <Card className="p-4">
                <ScrollArea className="h-[200px]">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={form.selectedQuestions.map(q => q.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {form.selectedQuestions.map((question, index) => (
                          <SortableQuestionItem
                            key={question.id}
                            question={question}
                            index={index}
                            onRemove={removeQuestion}
                            getDifficultyColor={getDifficultyColor}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </ScrollArea>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No hay preguntas seleccionadas. Haz clic en Agregar Pregunta para comenzar.
                </p>
              </Card>
            )}
          </div>

          {showQuestionSelector && form.subject && (
            <Card className="p-4 border-primary">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Seleccionar Preguntas</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuestionSelector(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subtopic-filter">Filtrar por Subtópico</Label>
                    <Select value={selectedSubtopic} onValueChange={setSelectedSubtopic}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {allSubtopics.map((subtopic) => (
                          <SelectItem key={subtopic} value={subtopic}>
                            {subtopic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty-filter">Filtrar por Dificultad</Label>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="Fácil">Fácil</SelectItem>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="Difícil">Difícil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {filteredQuestions.length > 0 ? (
                      filteredQuestions.map((question) => (
                        <div
                          key={question.id}
                          className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => addQuestion(question)}
                        >
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">{question.subtopic}</Badge>
                            <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                              {question.difficulty}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">{question.type}</Badge>
                          </div>
                          <p className="text-sm">{question.body}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No hay preguntas disponibles con estos filtros
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </Card>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={onSubmit}
            disabled={!form.name || !form.subject || form.selectedQuestions.length === 0}
          >
            {isEditMode ? "Actualizar Examen" : "Crear Examen"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}