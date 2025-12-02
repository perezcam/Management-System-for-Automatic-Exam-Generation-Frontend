import { Card } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Calendar, User, FileText } from "lucide-react"

export interface RevisionData {
  id: string
  nombrePrueba: string
  asignatura: string
  alumno: string
  fecha: string
  estado: "pendiente" | "revisado" | "reclamado"
  totalPreguntas: number
  calificacionTotal?: number
  comentarioReclamacion?: string
  preguntas: PreguntaRevision[]
}

export interface PreguntaRevision {
  id: string
  numero: number
  enunciado: string
  tipo: "Opción Múltiple" | "Verdadero/Falso" | "Ensayo"
  opciones?: string[]
  respuestaAlumno: string[]
  respuestaEsperada: string[]
  puntuacionMaxima: number
  puntuacionObtenida: number | null
}

interface RevisionCardProps {
  revision: RevisionData
  onClick: (revision: RevisionData) => void
}

export function RevisionCard({ revision, onClick }: RevisionCardProps) {
  const getEstadoBadge = (estado: RevisionData["estado"]) => {
    switch (estado) {
      case "pendiente":
        return <Badge variant="secondary" className="bg-orange-500/10 text-orange-700 border-orange-500/20">Pendiente</Badge>
      case "revisado":
        return <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20">Revisado</Badge>
      case "reclamado":
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-500/20">Reclamado</Badge>
    }
  }

  const isClickable = revision.estado === "pendiente" || revision.estado === "reclamado"

  return (
    <Card 
      className={`p-5 transition-colors ${
        isClickable 
          ? "cursor-pointer hover:bg-muted/30 hover:border-primary/50" 
          : "cursor-default"
      }`}
      onClick={() => isClickable && onClick(revision)}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex-1">
                <h3 className="font-medium mb-1">{revision.nombrePrueba}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {revision.asignatura}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {revision.calificacionTotal !== undefined && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-0.5">Calificación</div>
                <div className={`text-xl font-mono ${
                  revision.calificacionTotal >= 7 ? 'text-green-600' : 
                  revision.calificacionTotal >= 5 ? 'text-orange-600' : 
                  'text-red-600'
                }`}>
                  {revision.calificacionTotal.toFixed(1)}
                </div>
              </div>
            )}
            {getEstadoBadge(revision.estado)}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{revision.alumno}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{revision.fecha}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4 flex-shrink-0" />
            <span>{revision.totalPreguntas} preguntas</span>
          </div>
        </div>

        {revision.comentarioReclamacion && (
          <div className="pt-3 border-t">
            <div className="text-xs font-medium text-muted-foreground mb-1">Comentario del Estudiante:</div>
            <p className="text-sm text-blue-700 bg-blue-500/5 p-3 rounded-md border border-blue-500/20">
              {revision.comentarioReclamacion}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
