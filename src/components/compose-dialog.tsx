import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { Separator } from "./ui/separator"
import { Send, Paperclip, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react"

interface ComposeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  replyTo?: string
  subject?: string
}

export function ComposeDialog({ open, onOpenChange, replyTo, subject }: ComposeDialogProps) {
  const [to, setTo] = useState(replyTo || "")
  const [cc, setCc] = useState("")
  const [bcc, setBcc] = useState("")
  const [emailSubject, setEmailSubject] = useState(subject || "")
  const [body, setBody] = useState("")
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)

  const handleSend = () => {
    // In a real app, this would send the email
    console.log("Sending email:", { to, cc, bcc, subject: emailSubject, body })
    onOpenChange(false)
    // Reset form
    setTo("")
    setCc("")
    setBcc("")
    setEmailSubject("")
    setBody("")
  }

  const handleSaveDraft = () => {
    // In a real app, this would save as draft
    console.log("Saving draft:", { to, cc, bcc, subject: emailSubject, body })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Nuevo Mensaje</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          {/* Recipients */}
          <div className="p-6 pt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="to" className="w-12">Para</Label>
                <Input
                  id="to"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Destinatarios"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCc(!showCc)}
                >
                  Cc
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBcc(!showBcc)}
                >
                  Bcc
                </Button>
              </div>
              
              {showCc && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor="cc" className="w-12">Cc</Label>
                  <Input
                    id="cc"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    placeholder="Destinatarios Cc"
                    className="flex-1"
                  />
                </div>
              )}
              
              {showBcc && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor="bcc" className="w-12">Bcc</Label>
                  <Input
                    id="bcc"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    placeholder="Destinatarios Bcc"
                    className="flex-1"
                  />
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="subject" className="w-12">Asunto</Label>
                <Input
                  id="subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Asunto"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Formatting toolbar */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm">
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Italic className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Underline className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <Button variant="ghost" size="sm">
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <AlignRight className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <Button variant="ghost" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Message body */}
          <div className="flex-1 p-6">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="min-h-[300px] resize-none border-none p-0 focus-visible:ring-0"
            />
          </div>

          {/* Actions */}
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button onClick={handleSend}>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar
                </Button>
                <Button variant="outline" onClick={handleSaveDraft}>
                  Guardar Borrador
                </Button>
              </div>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Descartar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}