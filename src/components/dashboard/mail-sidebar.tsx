import { Button } from "../ui/button"
import { ClipboardCheck, MessageSquare, BarChart3, Users, Database, Settings, FileText, Sparkles, FileStack } from "lucide-react"

interface MailSidebarProps {
  selectedFolder: string
  onFolderSelect: (folder: string) => void
  onCompose: () => void
}

export function MailSidebar({ selectedFolder, onFolderSelect }: MailSidebarProps) {
  const folders = [
    { id: 'pruebas-aprobar', name: 'Pruebas a Aprobar', icon: ClipboardCheck },
    { id: 'mensajeria', name: 'Mensajería', icon: MessageSquare },
    { id: 'estadisticas-curso', name: 'Estadísticas de Curso', icon: BarChart3 },
    { id: 'admin-profesores', name: 'Administración de Profesores', icon: Users },
    { id: 'banco-examenes', name: 'Banco de Exámenes', icon: FileStack },
    { id: 'generador-preguntas', name: 'Generador de Preguntas', icon: Sparkles },
    { id: 'generador-examenes', name: 'Generador de Exámenes', icon: FileText },
    { id: 'banco-preguntas', name: 'Banco de Preguntas', icon: Database },
    { id: 'administracion', name: 'Administración', icon: Settings },
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