import { Card } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Calendar, User, Repeat, ClipboardList } from "lucide-react"

export type RevisionKind = "GRADE" | "REGRADE"

export interface RevisionItem {
  id: string
  assignmentId: string
  examId: string
  examTitle: string
  subjectId?: string
  subjectName: string
  studentId?: string
  studentName: string
  status: string
  grade: number | null
  createdAt?: string
  requestReason?: string
  kind: RevisionKind
}

interface RevisionCardProps {
  revision: RevisionItem
  onClick: (revision: RevisionItem) => void
}

const formatDate = (value?: string) => {
  if (!value) return "Sin fecha"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

const getEstadoBadge = (revision: RevisionItem) => {
  const { status, kind } = revision
  switch (status) {
    case "IN_EVALUATION":
      return <Badge variant="secondary" className="bg-orange-500/10 text-orange-700 border-orange-500/20">Por calificar</Badge>
    case "REQUESTED":
      return <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-500/20">{kind === "REGRADE" ? "Recalificación solicitada" : "Solicitud"}</Badge>
    case "IN_REVIEW":
      return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">En revisión</Badge>
    case "GRADED":
      return <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20">Calificada</Badge>
    default:
      return <Badge variant="secondary" className="bg-muted text-muted-foreground border-muted">{status}</Badge>
  }
}

export function RevisionCard({ revision, onClick }: RevisionCardProps) {
  const isClickable = revision.status !== "GRADED"
  const hasReason = Boolean(revision.requestReason)

  return (
    <Card
      className={`p-5 transition-colors ${isClickable
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
                <h3 className="font-medium mb-1">{revision.examTitle}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {revision.subjectName}
                  </Badge>
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    {revision.kind === "REGRADE" ? <Repeat className="h-3 w-3" /> : <ClipboardList className="h-3 w-3" />}
                    {revision.kind === "REGRADE" ? "Recalificación" : "Calificación"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {revision.grade !== null && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-0.5">Última nota</div>
                <div className={`text-xl font-mono ${revision.grade >= 7 ? "text-green-600" :
                  revision.grade >= 5 ? "text-orange-600" :
                    "text-red-600"
                  }`}>
                  {revision.grade.toFixed(1)}
                </div>
              </div>
            )}
            {getEstadoBadge(revision)}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{revision.studentName}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{formatDate(revision.createdAt)}</span>
          </div>
        </div>

        {hasReason && (
          <div className="pt-3 border-t">
            <div className="text-xs font-medium text-muted-foreground mb-1">Motivo del estudiante</div>
            <p className="text-sm text-blue-700 bg-blue-500/5 p-3 rounded-md border border-blue-500/20">
              {revision.requestReason}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
