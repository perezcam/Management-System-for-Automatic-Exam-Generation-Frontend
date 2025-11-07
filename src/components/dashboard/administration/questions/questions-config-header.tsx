import { ArrowLeft, BookOpen, GraduationCap, FolderTree, Database } from "lucide-react"
import { Button } from "../../../ui/button"
import { Card } from "../../../ui/card"

interface QuestionsConfigHeaderProps {
  onBack: () => void
  stats: {
    totalTypes: number
    totalSubjects: number
    totalTopics: number
    totalSubtopics: number
  }
}

export function QuestionsConfigHeader({ onBack, stats }: QuestionsConfigHeaderProps) {
  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl mb-2">Configuración de Preguntas</h1>
        <p className="text-muted-foreground">
          Gestiona tipos de preguntas, tópicos y subtópicos
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Tipos</p>
              <p className="text-2xl">{stats.totalTypes}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Materias</p>
              <p className="text-2xl">{stats.totalSubjects}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FolderTree className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Tópicos</p>
              <p className="text-2xl">{stats.totalTopics}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Subtópicos</p>
              <p className="text-2xl">{stats.totalSubtopics}</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
