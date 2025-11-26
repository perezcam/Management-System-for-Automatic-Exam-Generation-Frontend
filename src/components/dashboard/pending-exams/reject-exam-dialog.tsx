import { useState } from "react"
import { XCircle, MessageSquare } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Textarea } from "../../ui/textarea"
import { Button } from "../../ui/button"

interface RejectExamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReject: (comment?: string) => Promise<void> | void
  loading?: boolean
}

export function RejectExamDialog({
  open,
  onOpenChange,
  onReject,
  loading = false,
}: RejectExamDialogProps) {
  const [comment, setComment] = useState("")

  const handleReject = async () => {
    try {
      await onReject(comment.trim() || undefined)
      setComment("")
    } catch {
      // el manejador superior mostrará el error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Rechazar Examen
          </DialogTitle>
          <DialogDescription>
            Puedes proporcionar un comentario opcional explicando el motivo del rechazo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="comment">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comentario de Rechazo (Opcional)
              </div>
            </Label>
            <Textarea
              id="comment"
              placeholder="Ej: El examen no cumple con los estándares establecidos porque..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={loading}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Rechazar Examen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
