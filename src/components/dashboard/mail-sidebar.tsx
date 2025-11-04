import { Button } from "../ui/button"
import { ClipboardCheck, MessageSquare, BarChart3, Users, Database, Settings, FileText, Sparkles, FileStack, FileCheck, BookOpen } from "lucide-react"

interface MailSidebarProps {
  selectedFolder: string
  onFolderSelect: (folder: string) => void
  onCompose: () => void
}

export function MailSidebar({ selectedFolder, onFolderSelect }: MailSidebarProps) {
  const folders = [
    { id: 'messaging', name: 'Mensajería', icon: MessageSquare },
    { id: 'exams', name: 'Pruebas', icon: FileCheck },
    { id: 'subjects', name: 'Asignaturas', icon: BookOpen },
    { id: 'question-bank', name: 'Banco de Preguntas', icon: Database },
    { id: 'question-generator', name: 'Generador de Preguntas', icon: Sparkles },
    { id: 'exam-bank', name: 'Banco de Exámenes', icon: FileStack },
    { id: 'exam-generator', name: 'Generador de Exámenes', icon: FileText },
    { id: 'pending-exams', name: 'Pruebas a Aprobar', icon: ClipboardCheck },
    { id: 'statistics', name: 'Estadísticas de Curso', icon: BarChart3 },
    { id: 'administration', name: 'Administración de Usuarios', icon: Users },
    { id: 'configuration', name: 'Configuración', icon: Settings },
  ]

  return (
    <div className="w-64 border-r bg-muted/20 p-4">
      <div className="space-y-2">
        {folders.map((folder) => {
          const Icon = folder.icon
          return (
            <Button
              key={folder.id}
              variant={selectedFolder === folder.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onFolderSelect(folder.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span className="flex-1 text-left">{folder.name}</span>
            </Button>
          )
        })}
      </div>
      

    </div>
  )
}