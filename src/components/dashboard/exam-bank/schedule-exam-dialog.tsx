"use client"

import { useState } from "react"
import { Calendar, Clock, Users, Eye, EyeOff } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { ScrollArea } from "../../ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Exam } from "./types"

interface ScheduleExamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exam: Exam | null
  onSchedule: (examId: string, date: string, time: string, course: string) => void
}

// Mock de cursos disponibles
const mockCourses = [
  { id: "1", name: "Grupo A - Estructuras de Datos", students: 35 },
  { id: "2", name: "Grupo B - Estructuras de Datos", students: 32 },
  { id: "3", name: "Grupo C - Base de Datos", students: 28 },
  { id: "4", name: "Grupo D - Algoritmos", students: 30 },
]

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

export function ScheduleExamDialog({ open, onOpenChange, exam, onSchedule }: ScheduleExamDialogProps) {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  const handleSubmit = () => {
    if (exam && date && time && selectedCourse) {
      onSchedule(exam.id, date, time, selectedCourse)
      setDate("")
      setTime("")
      setSelectedCourse("")
      onOpenChange(false)
    }
  }

  if (!exam) return null

  const selectedCourseData = mockCourses.find(c => c.id === selectedCourse)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Programar Examen Aprobado</DialogTitle>
          <DialogDescription>
            Asigna el examen aprobado a un curso con fecha y hora específicas
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4 overflow-y-auto pr-2">
          <Card className="p-4 bg-accent/50">
            <div className="space-y-2">
              <h3 className="font-medium">{exam.name}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{exam.subject}</Badge>
                <Badge variant="secondary">
                  {exam.totalQuestions} pregunta{exam.totalQuestions !== 1 ? "s" : ""}
                </Badge>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  Aprobado
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Creado por:</span> {exam.createdBy}
                <span className="mx-2">•</span>
                <span className="font-medium">Validador:</span> {exam.validator}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">
                <Calendar className="inline h-4 w-4 mr-1" />
                Fecha del Examen
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">
                <Clock className="inline h-4 w-4 mr-1" />
                Hora del Examen
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">
              <Users className="inline h-4 w-4 mr-1" />
              Curso
            </Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un curso" />
              </SelectTrigger>
              <SelectContent>
                {mockCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name} ({course.students} estudiantes)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCourseData && (
              <p className="text-sm text-muted-foreground">
                El examen será asignado a {selectedCourseData.students} estudiantes
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="w-full"
            >
              {showPreview ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Ocultar Vista Previa
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Vista Previa del Examen
                </>
              )}
            </Button>

            {showPreview && (
              <Card className="p-4">
                <h4 className="font-medium mb-4">Vista Previa del Examen</h4>
                <ScrollArea className="h-[300px]">
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
              </Card>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!date || !time || !selectedCourse}
          >
            Programar Examen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
