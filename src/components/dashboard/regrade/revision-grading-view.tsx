"use client"

import { useState, useEffect } from "react"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { ScrollArea } from "../../ui/scroll-area"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Separator } from "../../ui/separator"
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  BookOpen, 
  CheckCircle2,
  FileText,
  Save,
  AlertCircle
} from "lucide-react"
import { RevisionData, PreguntaRevision } from "./revision-card"
import { showSuccess } from "../../../utils/toast"

interface RevisionGradingViewProps {
  revision: RevisionData
  onBack: () => void
  onSave: (revisionId: string, preguntasCalificadas: PreguntaRevision[], calificacionTotal: number) => void
}

export function RevisionGradingView({ revision, onBack, onSave }: RevisionGradingViewProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    revision.preguntas[0]?.id || null
  )
  
  const [preguntas, setPreguntas] = useState<PreguntaRevision[]>(revision.preguntas)

  // Auto-calificar preguntas de tipo MCQ y Verdadero/Falso al montar
  useEffect(() => {
    setPreguntas(prevPreguntas => 
      prevPreguntas.map(pregunta => {
        // Solo auto-calificar si es MCQ o V/F y no está ya calificada
        if ((pregunta.tipo === "Opción Múltiple" || pregunta.tipo === "Verdadero/Falso") && pregunta.puntuacionObtenida === null) {
          const esCorrecta = compararRespuestas(pregunta.respuestaAlumno, pregunta.respuestaEsperada)
          return {
            ...pregunta,
            puntuacionObtenida: esCorrecta ? pregunta.puntuacionMaxima : 0
          }
        }
        return pregunta
      })
    )
  }, [revision.id]) // Solo ejecutar cuando cambie la revisión

  const selectedQuestion = preguntas.find(q => q.id === selectedQuestionId)

  const handlePuntuacionChange = (questionId: string, puntuacion: string) => {
    const puntuacionNum = parseFloat(puntuacion)
    
    setPreguntas(preguntas.map(p => {
      if (p.id === questionId) {
        // Validar que no exceda la puntuación máxima
        const newPuntuacion = isNaN(puntuacionNum) ? null : Math.min(puntuacionNum, p.puntuacionMaxima)
        return { ...p, puntuacionObtenida: newPuntuacion }
      }
      return p
    }))
  }

  const handleSave = () => {
    // Calcular calificación total
    const totalObtenido = preguntas.reduce((sum, p) => sum + (p.puntuacionObtenida || 0), 0)
    const totalMaximo = preguntas.reduce((sum, p) => sum + p.puntuacionMaxima, 0)
    const calificacionTotal = totalMaximo > 0 ? (totalObtenido / totalMaximo) * 10 : 0

    onSave(revision.id, preguntas, calificacionTotal)
    showSuccess(
      "Revisión guardada",
      `Calificación total: ${calificacionTotal.toFixed(1)}/10`
    )
  }

  const preguntasCalificadas = preguntas.filter(p => p.puntuacionObtenida !== null).length
  const todasCalificadas = preguntasCalificadas === preguntas.length

  // Calcular calificación parcial
  const calcularCalificacionParcial = () => {
    const totalObtenido = preguntas.reduce((sum, p) => sum + (p.puntuacionObtenida || 0), 0)
    const totalMaximo = preguntas.reduce((sum, p) => sum + p.puntuacionMaxima, 0)
    return totalMaximo > 0 ? (totalObtenido / totalMaximo) * 10 : 0
  }

  const getTipoBadge = (tipo: PreguntaRevision["tipo"]) => {
    switch (tipo) {
      case "Opción Múltiple":
        return "Opción Múltiple"
      case "Verdadero/Falso":
        return "Verdadero/Falso"
      case "Ensayo":
        return "Ensayo"
    }
  }

  const compararRespuestas = (respuestaAlumno: string[], respuestaEsperada: string[]) => {
    const alumnoSet = new Set(respuestaAlumno.map(r => r.toLowerCase().trim()))
    const esperadaSet = new Set(respuestaEsperada.map(r => r.toLowerCase().trim()))
    
    if (alumnoSet.size !== esperadaSet.size) return false
    
    for (const resp of alumnoSet) {
      if (!esperadaSet.has(resp)) return false
    }
    
    return true
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b p-4 sm:p-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold mb-2">{revision.nombrePrueba}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span>{revision.asignatura}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>{revision.alumno}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{revision.fecha}</span>
                </div>
              </div>
              
              {revision.comentarioReclamacion && (
                <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-blue-700 mb-1">Reclamación del Estudiante:</div>
                      <p className="text-sm text-blue-700">{revision.comentarioReclamacion}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-1">Progreso</div>
                <div className="text-xl font-semibold">
                  {preguntasCalificadas}/{preguntas.length}
                </div>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-1">Calificación</div>
                <div className={`text-xl font-mono font-semibold ${
                  todasCalificadas 
                    ? calcularCalificacionParcial() >= 7 ? 'text-green-600' : 
                      calcularCalificacionParcial() >= 5 ? 'text-orange-600' : 'text-red-600'
                    : 'text-muted-foreground'
                }`}>
                  {todasCalificadas ? calcularCalificacionParcial().toFixed(1) : '--'}/10
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex gap-6 p-4 sm:p-6">
          {/* Questions List - igual a realizar examen */}
          <Card className="w-80 hidden lg:block">
            <div className="p-4 border-b">
              <h3 className="font-medium">Preguntas del Examen</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Selecciona una pregunta para calificar
              </p>
            </div>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="p-4 space-y-2">
                {preguntas.map((pregunta) => {
                  const isGraded = pregunta.puntuacionObtenida !== null
                  const isSelected = pregunta.id === selectedQuestionId
                  
                  return (
                    <button
                      key={pregunta.id}
                      onClick={() => setSelectedQuestionId(pregunta.id)}
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
                          ${isGraded 
                            ? 'bg-green-500/10 text-green-700 border-2 border-green-500' 
                            : 'bg-muted text-muted-foreground'
                          }
                        `}>
                          {isGraded ? <CheckCircle2 className="h-4 w-4" /> : pregunta.numero}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1">
                            Pregunta {pregunta.numero}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {pregunta.enunciado}
                          </div>
                          <Badge variant="secondary" className="text-xs mt-2">
                            {getTipoBadge(pregunta.tipo)}
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
          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {selectedQuestion ? (
              <Card className="flex-1 overflow-hidden flex flex-col">
                <div className="p-6 border-b bg-muted/30 flex-shrink-0">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                        {selectedQuestion.numero}
                      </div>
                      <div>
                        <Badge variant="secondary" className="mb-1">
                          {getTipoBadge(selectedQuestion.tipo)}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          Puntuación: {selectedQuestion.puntuacionMaxima} puntos
                        </div>
                      </div>
                    </div>
                    
                    {selectedQuestion.puntuacionObtenida !== null && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Calificada</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-base leading-relaxed font-medium">{selectedQuestion.enunciado}</p>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-6">
                    {/* Respuesta del Alumno */}
                    <div>
                      <Label className="text-base font-medium mb-3 block">Respuesta del Estudiante:</Label>
                      {selectedQuestion.tipo === "Ensayo" ? (
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg max-h-64 overflow-y-auto">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {selectedQuestion.respuestaAlumno[0] || "Sin respuesta"}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedQuestion.opciones?.map((opcion, index) => {
                            const isSelected = selectedQuestion.respuestaAlumno.includes(opcion)
                            const isCorrect = selectedQuestion.respuestaEsperada.includes(opcion)
                            
                            return (
                              <div 
                                key={index}
                                className={`p-3 rounded-lg border-2 ${
                                  isSelected 
                                    ? isCorrect
                                      ? 'bg-green-50 dark:bg-green-950/20 border-green-500'
                                      : 'bg-red-50 dark:bg-red-950/20 border-red-500'
                                    : 'bg-muted/30 border-muted'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  {isSelected && (
                                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                                      isCorrect ? 'bg-green-500' : 'bg-red-500'
                                    }`}>
                                      {isCorrect ? (
                                        <CheckCircle2 className="h-3 w-3 text-white" />
                                      ) : (
                                        <span className="text-white text-xs">✕</span>
                                      )}
                                    </div>
                                  )}
                                  <span className={`text-sm ${isSelected ? 'font-medium' : ''}`}>
                                    {opcion}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Respuesta Esperada - Solo para Ensayo */}
                    {selectedQuestion.tipo === "Ensayo" && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-base font-medium mb-3 block">Respuesta Esperada:</Label>
                          <div className="p-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-lg max-h-64 overflow-y-auto">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {selectedQuestion.respuestaEsperada[0]}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    {/* Calificación - Solo editable para Ensayo */}
                    <div>
                      <Label className="text-base font-medium mb-3 block">Calificación:</Label>
                      {selectedQuestion.tipo === "Ensayo" ? (
                        <div className="flex items-center gap-4">
                          <div className="flex-1 max-w-xs">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                max={selectedQuestion.puntuacionMaxima}
                                step="0.5"
                                value={selectedQuestion.puntuacionObtenida ?? ""}
                                onChange={(e) => handlePuntuacionChange(selectedQuestion.id, e.target.value)}
                                placeholder="0.0"
                                className="text-center text-lg font-semibold"
                              />
                              <span className="text-muted-foreground">/ {selectedQuestion.puntuacionMaxima}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Ingresa la puntuación obtenida (máximo {selectedQuestion.puntuacionMaxima} puntos)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
                          <span className="text-sm font-medium">Puntuación Obtenida:</span>
                          <div className={`text-2xl font-mono font-semibold ${
                            selectedQuestion.puntuacionObtenida === selectedQuestion.puntuacionMaxima 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {selectedQuestion.puntuacionObtenida}/{selectedQuestion.puntuacionMaxima}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-6 border-t bg-muted/30 flex-shrink-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      {selectedQuestion.puntuacionObtenida !== null ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Puntuación asignada: {selectedQuestion.puntuacionObtenida}/{selectedQuestion.puntuacionMaxima}
                        </span>
                      ) : (
                        <span>Asigna una puntuación para esta pregunta</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Selecciona una pregunta para calificar</p>
                </div>
              </Card>
            )}

            {/* Mobile Questions Navigation */}
            <Card className="lg:hidden p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">Navegación de Preguntas</h3>
                <span className="text-xs text-muted-foreground">
                  {preguntas.findIndex(q => q.id === selectedQuestionId) + 1} de {preguntas.length}
                </span>
              </div>
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  {preguntas.map((pregunta) => {
                    const isGraded = pregunta.puntuacionObtenida !== null
                    const isCurrent = pregunta.id === selectedQuestionId
                    
                    return (
                      <button
                        key={pregunta.id}
                        onClick={() => setSelectedQuestionId(pregunta.id)}
                        className={`
                          flex-shrink-0 w-10 h-10 rounded-md border-2 flex items-center justify-center text-sm font-medium
                          transition-all
                          ${isCurrent 
                            ? 'border-primary bg-primary text-primary-foreground' 
                            : isGraded
                              ? 'border-green-500 bg-green-500/10 text-green-700'
                              : 'border-muted-foreground/20 bg-background'
                          }
                        `}
                      >
                        {pregunta.numero}
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            </Card>

            {/* Save Button */}
            <Card className="p-4 flex-shrink-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {todasCalificadas 
                      ? "Todas las preguntas calificadas" 
                      : `${preguntasCalificadas} de ${preguntas.length} preguntas calificadas`
                    }
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {todasCalificadas 
                      ? `Calificación final: ${calcularCalificacionParcial().toFixed(1)}/10`
                      : "Completa todas las preguntas para guardar"
                    }
                  </p>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={!todasCalificadas}
                  size="lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Revisión
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}