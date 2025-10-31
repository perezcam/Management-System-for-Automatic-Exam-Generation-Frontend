'use client';

import { useState } from "react"
import { MailList, Email } from "@/components/mail-list"
import { ComposeDialog } from "@/components/compose-dialog"

// Mock email data for teacher administration
const mockEmails: Email[] = [
  {
    id: "10",
    sender: "Administración Académica",
    senderEmail: "admin@universidad.edu",
    subject: "Recordatorio: Fechas límite para entrega de evaluaciones",
    preview: "Estimados profesores, recordamos que las evaluaciones deben ser enviadas para aprobación con al menos 48 horas de anticipación...",
    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    labels: ["Administración"]
  },
  {
    id: "11",
    sender: "Dirección Académica",
    senderEmail: "direccion@universidad.edu",
    subject: "Actualización de políticas de evaluación",
    preview: "Se han actualizado las políticas para la creación y aprobación de evaluaciones académicas...",
    date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    isStarred: false,
    hasAttachment: true,
    labels: ["Administración", "Importante"]
  }
]

export default function AdminProfesoresView() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)


  return (
    <>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <MailList
            emails={mockEmails}
            selectedEmail={selectedEmail}
            onEmailSelect={setSelectedEmail}
          />
        </div>
      </div>

      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
      />
    </>
  )
}
