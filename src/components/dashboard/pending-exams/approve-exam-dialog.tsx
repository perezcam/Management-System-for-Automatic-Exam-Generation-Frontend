'use client';

import { useState } from "react"
import { CheckCircle, MessageSquare } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Textarea } from "../../ui/textarea"
import { Button } from "../../ui/button"

interface ApproveExamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove: (comment?: string) => Promise<void> | void
  loading?: boolean
}

export function ApproveExamDialog({
  open,
  onOpenChange,
  onApprove,
  loading = false,
}: ApproveExamDialogProps) {
  const [comment, setComment] = useState("")

  const handleApprove = async () => {
    try {
      await onApprove(comment.trim() || undefined)
      setComment("")
    } catch {
      // el manejador superior mostrarA? el error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Aprobar Examen
          </DialogTitle>
          <DialogDescription>
            Puedes agregar un comentario opcional para el profesor sobre la aprobación del examen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
            <div className="space-y-2">
            <Label htmlFor="comment">
              <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comentario (Opcional)
              </div>
            </Label>
            <Textarea
              id="comment"
              placeholder="Ej: Excelente examen, bien estructurado y equilibrado..."
              value={comment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
              rows={6}
              className="resize-none"
            />
            </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleApprove} disabled={loading}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Aprobar Examen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
