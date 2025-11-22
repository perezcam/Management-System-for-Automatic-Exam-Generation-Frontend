import { Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Checkbox } from "../../ui/checkbox"
import { AutomaticExamForm, Subject, QuestionType } from "./types"

interface AutomaticExamFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: AutomaticExamForm
  onFormChange: (form: AutomaticExamForm) => void
  subjects: Subject[]
  onGenerate: () => void
}

const QUESTION_TYPES: QuestionType[] = ["Ensayo", "Opción Múltiple", "Verdadero/Falso"]
const DIFFICULTIES: ("Fácil" | "Regular" | "Difícil")[] = ["Fácil", "Regular", "Difícil"]

export function AutomaticExamFormDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  subjects,
  onGenerate
}: AutomaticExamFormDialogProps) {
  const selectedSubject = subjects.find(s => s.id === form.subject)

  const updateDifficultyCount = (difficulty: "Fácil" | "Regular" | "Difícil", count: number) => {
    const existingIndex = form.difficultyDistribution.findIndex(d => d.difficulty === difficulty)
    
    if (existingIndex >= 0) {
      const updated = [...form.difficultyDistribution]
      updated[existingIndex] = { difficulty, count }
      onFormChange({ ...form, difficultyDistribution: updated })
    } else {
      onFormChange({
        ...form,
        difficultyDistribution: [...form.difficultyDistribution, { difficulty, count }]
      })
    }
  }

  const getDifficultyCount = (difficulty: "Fácil" | "Regular" | "Difícil") => {
    return form.difficultyDistribution.find(d => d.difficulty === difficulty)?.count || 0
  }

  const totalDifficultyCount = form.difficultyDistribution.reduce((sum, d) => sum + d.count, 0)

  const updateQuestionTypeCount = (type: QuestionType, count: number) => {
    const existingIndex = form.questionTypeDistribution.findIndex(d => d.type === type)
    
    if (existingIndex >= 0) {
      const updated = [...form.questionTypeDistribution]
      updated[existingIndex] = { type, count }
      onFormChange({ ...form, questionTypeDistribution: updated })
    } else {
      onFormChange({
        ...form,
        questionTypeDistribution: [...form.questionTypeDistribution, { type, count }]
      })
    }
  }

  const getQuestionTypeCount = (type: QuestionType) => {
    return form.questionTypeDistribution.find(d => d.type === type)?.count || 0
  }

  const totalCount = form.questionTypeDistribution.reduce((sum, d) => sum + d.count, 0)
  
  const updateSubtopicCount = (subtopic: string, count: number) => {
    const existingIndex = form.subtopicDistribution.findIndex(d => d.subtopic === subtopic)
    
    if (existingIndex >= 0) {
      const updated = [...form.subtopicDistribution]
      updated[existingIndex] = { subtopic, count }
      onFormChange({ ...form, subtopicDistribution: updated })
    } else {
      onFormChange({
        ...form,
        subtopicDistribution: [...form.subtopicDistribution, { subtopic, count }]
      })
    }
  }

  const getSubtopicCount = (subtopic: string) => {
    return form.subtopicDistribution.find(d => d.subtopic === subtopic)?.count || 0
  }

  const totalSubtopicCount = form.subtopicDistribution.reduce((sum, d) => sum + d.count, 0)
  
  const toggleSubtopic = (subtopic: string) => {
    if (form.topicCoverage.includes(subtopic)) {
      onFormChange({
        ...form,
        topicCoverage: form.topicCoverage.filter(s => s !== subtopic),
        subtopicDistribution: form.subtopicDistribution.filter(d => d.subtopic !== subtopic)
      })
    } else {
      onFormChange({
        ...form,
        topicCoverage: [...form.topicCoverage, subtopic]
      })
    }
  }

  const canGenerate = form.name && 
                      form.subject && 
                      form.totalQuestions > 0 && 
                      totalCount === form.totalQuestions &&
                      totalDifficultyCount === form.totalQuestions &&
                      form.topicCoverage.length > 0 &&
                      totalSubtopicCount === form.totalQuestions

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Generar Examen Automático</DialogTitle>
          <DialogDescription>
            Configura los parámetros para generar el examen automáticamente
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
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
                onValueChange={(value) => onFormChange({ 
                  ...form, 
                  subject: value, 
                  topicCoverage: [],
                  subtopicDistribution: []
                })}
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
            <Label htmlFor="totalQuestions">Cantidad de Preguntas</Label>
            <Input
              id="totalQuestions"
              type="number"
              min="1"
              value={form.totalQuestions}
              onChange={(e) => onFormChange({ 
                ...form, 
                totalQuestions: parseInt(e.target.value) || 1 
              })}
            />
          </div>

          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Distribución de Tipos de Preguntas</Label>
                <Badge variant={totalCount === form.totalQuestions ? "default" : "destructive"}>
                  Total: {totalCount}/{form.totalQuestions}
                </Badge>
              </div>
              <div className="space-y-3">
                {QUESTION_TYPES.map((type) => (
                  <div key={type} className="flex items-center gap-3">
                    <Label className="text-sm flex-1">{type}</Label>
                    <Input
                      type="number"
                      min="0"
                      max={form.totalQuestions}
                      value={getQuestionTypeCount(type)}
                      onChange={(e) => updateQuestionTypeCount(type, parseInt(e.target.value) || 0)}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground w-16">preguntas</span>
                  </div>
                ))}
              </div>
              {totalCount !== form.totalQuestions && (
                <p className="text-sm text-destructive">
                  La suma debe ser igual a {form.totalQuestions} pregunta{form.totalQuestions !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Distribución de Dificultad</Label>
                <Badge variant={totalDifficultyCount === form.totalQuestions ? "default" : "destructive"}>
                  Total: {totalDifficultyCount}/{form.totalQuestions}
                </Badge>
              </div>
              <div className="space-y-3">
                {DIFFICULTIES.map((difficulty) => (
                  <div key={difficulty} className="flex items-center gap-3">
                    <Label className="text-sm flex-1">{difficulty}</Label>
                    <Input
                      type="number"
                      min="0"
                      max={form.totalQuestions}
                      value={getDifficultyCount(difficulty)}
                      onChange={(e) => updateDifficultyCount(difficulty, parseInt(e.target.value) || 0)}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground w-16">preguntas</span>
                  </div>
                ))}
              </div>
              {totalDifficultyCount !== form.totalQuestions && (
                <p className="text-sm text-destructive">
                  La suma debe ser igual a {form.totalQuestions} pregunta{form.totalQuestions !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </Card>

          {form.subject && (
            <Card className="p-4">
              <div className="space-y-4">
                <Label>Cobertura de Temas</Label>
                <p className="text-sm text-muted-foreground">
                  Selecciona los subtópicos que deseas incluir en el examen
                </p>
                <div className="space-y-3">
                  {selectedSubject?.topics.map((topic) => (
                    <div key={topic.id} className="space-y-2">
                      <h4 className="font-medium text-sm">{topic.name}</h4>
                      <div className="grid grid-cols-2 gap-2 pl-4">
                        {topic.subtopics.map((subtopic) => (
                          <div key={subtopic} className="flex items-center space-x-2">
                            <Checkbox
                              id={subtopic}
                              checked={form.topicCoverage.includes(subtopic)}
                              onCheckedChange={() => toggleSubtopic(subtopic)}
                            />
                            <label
                              htmlFor={subtopic}
                              className="text-sm cursor-pointer"
                            >
                              {subtopic}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {form.topicCoverage.length === 0 && (
                  <p className="text-sm text-destructive">
                    Debes seleccionar al menos un subtópico
                  </p>
                )}
              </div>
            </Card>
          )}

          {form.topicCoverage.length > 0 && (
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Distribución de Preguntas por Subtópico</Label>
                  <Badge variant={totalSubtopicCount === form.totalQuestions ? "default" : "destructive"}>
                    Total: {totalSubtopicCount}/{form.totalQuestions}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Especifica cuántas preguntas incluir de cada subtópico
                </p>
                <div className="space-y-3">
                  {form.topicCoverage.map((subtopic) => (
                    <div key={subtopic} className="flex items-center gap-3">
                      <Label className="text-sm flex-1">{subtopic}</Label>
                      <Input
                        type="number"
                        min="0"
                        max={form.totalQuestions}
                        value={getSubtopicCount(subtopic)}
                        onChange={(e) => updateSubtopicCount(subtopic, parseInt(e.target.value) || 0)}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground w-16">preguntas</span>
                    </div>
                  ))}
                </div>
                {totalSubtopicCount !== form.totalQuestions && (
                  <p className="text-sm text-destructive">
                    La suma debe ser igual a {form.totalQuestions} pregunta{form.totalQuestions !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={onGenerate}
            disabled={!canGenerate}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generar Vista Previa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}