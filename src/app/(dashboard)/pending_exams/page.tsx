'use client'

import { useState } from "react"
import { MailList, Email } from "@/components/dashboard/mail-list"
import { MailDetail } from "@/components/dashboard/mail-detail"
import { ComposeDialog } from "@/components/dashboard/compose-dialog"

// Mock email data for test approval
const mockEmails: Email[] = [
  {
    id: "1",
    sender: "Prof. María García",
    senderEmail: "maria.garcia@universidad.edu",
    subject: "Examen Final de Matemáticas - Solicitud de Aprobación",
    preview: "Estimado coordinador, adjunto el examen final de Matemáticas Avanzadas para su revisión y aprobación. El examen incluye 5 problemas...",
    date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    isStarred: true,
    hasAttachment: true,
    labels: ["Académico", "Importante"]
  },
  {
    id: "2",
    sender: "Dr. Carlos Rodríguez",
    senderEmail: "carlos.rodriguez@universidad.edu",
    subject: "Prueba de Historia - Segundo Parcial",
    preview: "Buenos días, envío la prueba del segundo parcial de Historia Universal para su aprobación. La prueba consta de 3 secciones...",
    date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    isStarred: false,
    hasAttachment: true,
    labels: ["Académico"]
  },
  {
    id: "3",
    sender: "Prof. Ana López",
    senderEmail: "ana.lopez@universidad.edu",
    subject: "Examen de Química Orgánica - Revisión Urgente",
    preview: "Necesito aprobación urgente para el examen de Química Orgánica programado para mañana. He incluido la clave de respuestas...",
    date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    isStarred: true,
    hasAttachment: true,
    labels: ["Académico", "Importante"]
  },
  {
    id: "4",
    sender: "Dr. Roberto Fernández",
    senderEmail: "roberto.fernandez@universidad.edu",
    subject: "Quiz de Física - Mecánica Cuántica",
    preview: "Adjunto el quiz semanal de Física sobre Mecánica Cuántica. Son 10 preguntas de opción múltiple y 2 problemas prácticos...",
    date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    isStarred: false,
    hasAttachment: true,
    labels: ["Académico"]
  },
  {
    id: "5",
    sender: "Prof. Elena Martínez",
    senderEmail: "elena.martinez@universidad.edu",
    subject: "Examen de Literatura Española - Siglo de Oro",
    preview: "Estimado coordinador, envío el examen sobre Literatura del Siglo de Oro español. Incluye análisis de textos de Cervantes y Lope de Vega...",
    date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    isStarred: false,
    hasAttachment: true,
    labels: ["Académico"]
  }
]

export default function PruebasAprobarView() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeReplyTo, setComposeReplyTo] = useState<string>("")
  const [composeSubject, setComposeSubject] = useState<string>("")

  const selectedEmailData = selectedEmail ? mockEmails.find(e => e.id === selectedEmail) ?? null : null

  const handleReply = () => {
    if (selectedEmailData) {
      setComposeReplyTo(selectedEmailData.senderEmail)
      setComposeSubject(`Re: ${selectedEmailData.subject}`)
      setComposeOpen(true)
    }
  }

  return (
    <>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-96 border-r">
          <MailList
            emails={mockEmails}
            selectedEmail={selectedEmail}
            onEmailSelect={setSelectedEmail}
          />
        </div>
        
        <MailDetail
          email={selectedEmailData}
          onReply={handleReply}
        />
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
