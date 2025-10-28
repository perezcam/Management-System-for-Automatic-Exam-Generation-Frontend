import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import { Reply, Paperclip } from "lucide-react"
import { Email } from "./mail-list"

interface MailDetailProps {
  email: Email | null
  onReply: () => void
}

export function MailDetail({ email, onReply }: MailDetailProps) {
  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <h3 className="text-lg mb-2">Ningún correo seleccionado</h3>
          <p>Selecciona un correo de la lista para ver su contenido</p>
        </div>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Mock email content based on email subject
  const getEmailContent = (email: Email) => {
    if (email.subject.includes("Matemáticas")) {
      return `Estimado Coordinador Académico,

Espero que se encuentre bien. Me dirijo a usted para solicitar la aprobación del examen final de Matemáticas Avanzadas del curso MA-401.

El examen ha sido diseñado considerando los siguientes aspectos:

• Cubre todos los temas del programa académico
• Incluye 5 problemas de diferentes niveles de dificultad
• Tiempo estimado de resolución: 3 horas
• Modalidad: presencial con calculadora científica permitida

El examen está programado para el próximo viernes 22 de marzo a las 9:00 AM en el aula magna. Adjunto encontrará el examen completo junto con la clave de respuestas y la rúbrica de evaluación.

Por favor, confirme su aprobación a la brevedad posible para proceder con la impresión y distribución.

Atentamente,
${email.sender}`
    } else if (email.subject.includes("Historia")) {
      return `Buenos días,

Envío para su revisión y aprobación la prueba del segundo parcial de Historia Universal correspondiente al período 1800-1900.

Detalles de la evaluación:

• 3 secciones: opción múltiple, desarrollo breve y ensayo
• Duración: 2 horas y 30 minutos
• Valor: 25% de la calificación final
• Temas principales: Revolución Industrial, Independencias Americanas, Unificación Alemana

La prueba está programada para el miércoles 20 de marzo. Adjunto el documento completo para su consideración.

Quedo atento a sus comentarios.

Cordialmente,
${email.sender}`
    } else if (email.subject.includes("Química")) {
      return `Estimado Coordinador,

¡Urgente! Necesito su aprobación para el examen de Química Orgánica programado para mañana a las 2:00 PM.

Debido a un cambio de último momento en el cronograma, requiero su autorización inmediata. El examen incluye:

• Nomenclatura de compuestos orgánicos
• Reacciones de sustitución y eliminación
• Mecanismos de reacción
• Síntesis orgánica básica

He incluido tanto el examen como la clave de respuestas detallada. La evaluación tiene una duración de 2 horas.

Agradezco su pronta respuesta.

Saludos,
${email.sender}`
    } else {
      return `Estimado/a Coordinador/a,

Espero que se encuentre bien. Me dirijo a usted para solicitar la aprobación de la evaluación académica correspondiente a mi asignatura.

He preparado cuidadosamente esta evaluación siguiendo los estándares académicos establecidos y los objetivos del curso. Adjunto encontrará todos los documentos necesarios para su revisión.

Quedo atento/a a sus comentarios y sugerencias.

Atentamente,
${email.sender}`
    }
  }

  const emailContent = getEmailContent(email)

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center space-x-2 mb-4">
          {email.labels.map((label) => (
            <Badge key={label} variant="outline">
              {label}
            </Badge>
          ))}
        </div>
        
        <h1 className="text-xl mb-4">{email.subject}</h1>
        
        <div className="flex items-start space-x-3">
          <Avatar>
            <AvatarFallback>
              {getInitials(email.sender)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{email.sender}</p>
                <p className="text-sm text-muted-foreground">{email.senderEmail}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {formatFullDate(email.date)}
                </p>
                {email.hasAttachment && (
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <Paperclip className="h-3 w-3 mr-1" />
                    1 adjunto
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        <Card className="p-6">
          <div className="whitespace-pre-wrap">{emailContent}</div>
          
          {email.hasAttachment && (
            <>
              <Separator className="my-6" />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Adjuntos</h4>
                <div className="flex items-center space-x-2 p-2 border rounded">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">examen-matematicas.pdf</span>
                  <span className="text-xs text-muted-foreground ml-auto">2.4 MB</span>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Actions */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Button onClick={onReply}>
            <Reply className="mr-2 h-4 w-4" />
            Responder
          </Button>
        </div>
      </div>
    </div>
  )
}