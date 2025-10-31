import { Card } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, FileText } from "lucide-react"

export default function EstadisticasCursoView() {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl mb-2">Estadísticas de Curso</h1>
          <p className="text-muted-foreground">
            Visualiza el desempeño y métricas de los cursos académicos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Estudiantes</p>
                <p className="text-2xl">1,234</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exámenes Realizados</p>
                <p className="text-2xl">156</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Promedio General</p>
                <p className="text-2xl">85%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cursos Activos</p>
                <p className="text-2xl">24</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-lg mb-4">Próximamente</h2>
          <p className="text-muted-foreground">
            Las estadísticas detalladas y gráficos de rendimiento estarán disponibles próximamente.
          </p>
        </Card>
      </div>
    </div>
  )
}
