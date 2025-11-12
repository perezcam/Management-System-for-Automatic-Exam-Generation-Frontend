import { BookOpen, GraduationCap, FolderTree, Database } from "lucide-react"
import { Card } from "../../../ui/card"

interface QuestionsConfigHeaderProps {
  stats: {
    totalTypes: number
    totalSubjects: number
    totalTopics: number
    totalSubtopics: number
  }
}

export function QuestionsConfigHeader({stats }: QuestionsConfigHeaderProps) {
  return (
    <>

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
