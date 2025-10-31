'use client';

import { useState } from "react"
import { MailList, Email } from "@/components/mail-list"
import { MailDetail } from "@/components/mail-detail"
import { ComposeDialog } from "@/components/compose-dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Mock email data for messaging
const mockEmails: Email[] = [
  {
    id: "6",
    sender: "Administración Académica",
    senderEmail: "admin@universidad.edu",
    subject: "Recordatorio: Fechas límite para entrega de evaluaciones",
    preview: "Estimados profesores, recordamos que las evaluaciones deben ser enviadas para aprobación con al menos 48 horas de anticipación...",
    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    labels: ["Trabajo"]
  },
  {
    id: "8",
    sender: "Prof. Carmen Silva",
    senderEmail: "carmen.silva@universidad.edu",
    subject: "Presentaciones Estudiantiles - Rúbrica de Evaluación",
    preview: "Adjunto la rúbrica para evaluar las presentaciones finales de los estudiantes de Comunicación Efectiva...",
    date: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    isStarred: false,
    hasAttachment: true,
    labels: ["Trabajo"]
  },
  {
    id: "9",
    sender: "Sistema Académico",
    senderEmail: "sistema@universidad.edu",
    subject: "Notificación: Nueva solicitud de aprobación pendiente",
    preview: "Tiene una nueva solicitud de aprobación de examen pendiente en su bandeja. Por favor revise lo antes posible...",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    labels: ["Trabajo"]
  }
]

export default function MensajeriaView() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [showMessageDetail, setShowMessageDetail] = useState(true)
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeReplyTo, setComposeReplyTo] = useState<string>("")
  const [composeSubject, setComposeSubject] = useState<string>("")

  const selectedEmailData = selectedEmail ? (mockEmails.find(e => e.id === selectedEmail) ?? null) : null

  const handleReply = () => {
    if (selectedEmailData) {
      setComposeReplyTo(selectedEmailData.senderEmail)
      setComposeSubject(`Re: ${selectedEmailData.subject}`)
      setComposeOpen(true)
    }
  }

  return (
    <>
      <div className="flex flex-1 overflow-hidden flex-col">
        <div className="border-b p-3 flex items-center justify-end space-x-2">
          <Label htmlFor="show-detail" className="text-sm">Mostrar el mensaje al lado</Label>
          <Switch
            id="show-detail"
            checked={showMessageDetail}
            onCheckedChange={setShowMessageDetail}
          />
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          <div className={showMessageDetail ? "w-96 border-r" : "flex-1"}>
            <MailList
              emails={mockEmails}
              selectedEmail={selectedEmail}
              onEmailSelect={setSelectedEmail}
            />
          </div>
          
          {showMessageDetail && (
            <MailDetail
              email={selectedEmailData}
              onReply={handleReply}
            />
          )}
        </div>
      </div>

      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        replyTo={composeReplyTo}
        subject={composeSubject}
      />
    </>
  )
}
