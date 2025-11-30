"use client"

import { useState, useEffect } from "react"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Separator } from "../../ui/separator"
import { ScrollArea } from "../../ui/scroll-area"
import { Textarea } from "../../ui/textarea"
import { Checkbox } from "../../ui/checkbox"
import { Label } from "../../ui/label"
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  GraduationCap, 
  BookOpen, 
  CheckCircle2,
  FileText,
  Send
} from "lucide-react"

interface Question {
  id: string
  number: number
  type: "multiple-choice" | "true-false" | "essay"
  body: string
  options?: string[]
  topic?: string
  subtopic?: string
}

interface Answer {
  questionId: string
  answer: string[] // Array para permitir múltiples respuestas
  submitted: boolean
  submittedAt?: string
}

interface ExamData {
  id: string
  nombre: string
  asignatura: string
  fecha: string
  hora: string
  duracion: number
  profesor: string
  estudiantes: number
  curso: string
  questions: Question[]
}

interface ExamTakingViewProps {
  exam: ExamData
  onBack: () => void
}

// Función para obtener/crear el tiempo de inicio del examen
function getExamStartTime(examId: string): number {
  const key = `exam_start_${examId}`
  const stored = localStorage.getItem(key)
  
  if (stored) {
    return parseInt(stored, 10)
  }
  
  const startTime = Date.now()
  localStorage.setItem(key, startTime.toString())
  return startTime
}

export function ExamTakingView({ exam, onBack }: ExamTakingViewProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    exam.questions[0]?.id || null
  )
  
  const [answers, setAnswers] = useState<Answer[]>(
    exam.questions.map(q => ({
      questionId: q.id,
      answer: [],
      submitted: false
    }))
  )
  
  const [startTime] = useState(() => getExamStartTime(exam.id))
  const [timeRemaining, setTimeRemaining] = useState(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    const totalTime = exam.duracion * 60
    return Math.max(0, totalTime - elapsed)
  })

  const selectedQuestion = exam.questions.find(q => q.id === selectedQuestionId)
  const currentAnswer = answers.find(a => a.questionId === selectedQuestionId)

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const totalTime = exam.duracion * 60
      const remaining = Math.max(0, totalTime - elapsed)
      
      setTimeRemaining(remaining)
      
      if (remaining <= 0) {
        clearInterval(timer)
        // Aquí podrías enviar automáticamente el examen
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime, exam.duracion])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleCheckboxChange = (option: string, checked: boolean) => {
    setAnswers(answers.map(a => {
      if (a.questionId === selectedQuestionId) {
        const newAnswer = checked
          ? [...a.answer, option]
          : a.answer.filter(ans => ans !== option)
        return { ...a, answer: newAnswer }
      }
      return a
    }))
  }

  const handleEssayChange = (value: string) => {
    setAnswers(answers.map(a => 
      a.questionId === selectedQuestionId 
        ? { ...a, answer: [value] }
        : a
    ))
  }

  const handleSubmitAnswer = () => {
    setAnswers(answers.map(a => 
      a.questionId === selectedQuestionId 
        ? { ...a, submitted: true, submittedAt: new Date().toISOString() }
        : a
    ))
  }

  const answeredCount = answers.filter(a => a.submitted).length

  const getQuestionTypeBadge = (type: Question["type"]) => {
    switch (type) {
      case "multiple-choice":
        return "Opción Múltiple"
      case "true-false":
        return "Verdadero/Falso"
      case "essay":
        return "Ensayo"
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold mb-2">{exam.nombre}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span>{exam.asignatura}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  <span>{exam.profesor}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{exam.fecha} - {exam.hora}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-1">Tiempo Restante</div>
                <div className="flex items-center gap-2">
                  <Clock className={`h-4 w-4 ${timeRemaining < 600 ? 'text-red-600' : 'text-orange-600'}`} />
                  <span className={`text-xl font-mono font-semibold ${timeRemaining < 600 ? 'text-red-600' : 'text-orange-600'}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-1">Progreso</div>
                <div className="text-xl font-semibold">
                  {answeredCount}/{exam.questions.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex gap-6 p-4 sm:p-6">
          {/* Questions List */}
          <Card className="w-80 hidden lg:block">
            <div className="p-4 border-b">
              <h3 className="font-medium">Preguntas del Examen</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Selecciona una pregunta para responder
              </p>
            </div>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="p-4 space-y-2">
                {exam.questions.map((question) => {
                  const answer = answers.find(a => a.questionId === question.id)
                  const isAnswered = answer?.submitted
                  const isSelected = question.id === selectedQuestionId
                  
                  return (
                    <button
                      key={question.id}
                      onClick={() => setSelectedQuestionId(question.id)}
                      className={`
                        w-full text-left p-3 rounded-lg border-2 transition-all
                        ${isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-transparent hover:border-muted-foreground/20 hover:bg-muted/50'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 text-sm font-medium
                          ${isAnswered 
                            ? 'bg-green-500/10 text-green-700 border-2 border-green-500' 
                            : 'bg-muted text-muted-foreground'
                          }
                        `}>
                          {isAnswered ? <CheckCircle2 className="h-4 w-4" /> : question.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1">
                            Pregunta {question.number}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {question.body}
                          </div>
                          <Badge variant="secondary" className="text-xs mt-2">
                            {getQuestionTypeBadge(question.type)}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </Card>

          {/* Question Details Panel */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {selectedQuestion ? (
              <Card className="flex-1 overflow-hidden flex flex-col">
                <div className="p-6 border-b bg-muted/30">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                        {selectedQuestion.number}
                      </div>
                      <div>
                        <Badge variant="secondary" className="mb-1">
                          {getQuestionTypeBadge(selectedQuestion.type)}
                        </Badge>
                        {selectedQuestion.topic && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {selectedQuestion.topic} {selectedQuestion.subtopic && `• ${selectedQuestion.subtopic}`}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {currentAnswer?.submitted && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Respondida</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-base leading-relaxed">{selectedQuestion.body}</p>
                </div>

                <ScrollArea className="flex-1 p-6">
                  {/* Multiple Choice */}
                  {selectedQuestion.type === "multiple-choice" && selectedQuestion.options && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground mb-4">
                        Selecciona una o más opciones que consideres correctas
                      </p>
                      {selectedQuestion.options.map((option, index) => (
                        <div 
                          key={index} 
                          className="flex items-start space-x-3 p-4 rounded-lg border-2 hover:border-primary/50 transition-colors"
                        >
                          <Checkbox
                            id={`option-${selectedQuestion.id}-${index}`}
                            checked={currentAnswer?.answer.includes(option) || false}
                            onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
                          />
                          <Label 
                            htmlFor={`option-${selectedQuestion.id}-${index}`} 
                            className="flex-1 cursor-pointer leading-relaxed"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* True/False */}
                  {selectedQuestion.type === "true-false" && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground mb-4">
                        Selecciona una o más opciones que consideres correctas
                      </p>
                      <div className="flex items-start space-x-3 p-4 rounded-lg border-2 hover:border-primary/50 transition-colors">
                        <Checkbox
                          id={`true-${selectedQuestion.id}`}
                          checked={currentAnswer?.answer.includes("Verdadero") || false}
                          onCheckedChange={(checked) => handleCheckboxChange("Verdadero", checked as boolean)}
                        />
                        <Label 
                          htmlFor={`true-${selectedQuestion.id}`}
                          className="flex-1 cursor-pointer leading-relaxed"
                        >
                          Verdadero
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3 p-4 rounded-lg border-2 hover:border-primary/50 transition-colors">
                        <Checkbox
                          id={`false-${selectedQuestion.id}`}
                          checked={currentAnswer?.answer.includes("Falso") || false}
                          onCheckedChange={(checked) => handleCheckboxChange("Falso", checked as boolean)}
                        />
                        <Label 
                          htmlFor={`false-${selectedQuestion.id}`}
                          className="flex-1 cursor-pointer leading-relaxed"
                        >
                          Falso
                        </Label>
                      </div>
                    </div>
                  )}

                  {/* Essay */}
                  {selectedQuestion.type === "essay" && (
                    <div>
                      <Label htmlFor="essay-answer" className="mb-2 block">
                        Tu respuesta:
                      </Label>
                      <Textarea
                        id="essay-answer"
                        value={currentAnswer?.answer[0] || ""}
                        onChange={(e) => handleEssayChange(e.target.value)}
                        placeholder="Escribe tu respuesta aquí..."
                        className="min-h-[300px] resize-none"
                      />
                      <div className="text-xs text-muted-foreground mt-2">
                        {currentAnswer?.answer[0]?.length || 0} caracteres
                      </div>
                    </div>
                  )}
                </ScrollArea>

                <div className="p-6 border-t bg-muted/30">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      {currentAnswer?.submitted ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Respuesta guardada
                        </span>
                      ) : (
                        <span>Selecciona tus respuestas y guarda para continuar</span>
                      )}
                    </div>

                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={currentAnswer?.answer.length === 0}
                      variant={currentAnswer?.submitted ? "secondary" : "default"}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {currentAnswer?.submitted ? "Actualizar Respuesta" : "Guardar Respuesta"}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Selecciona una pregunta para comenzar</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}