import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Database, Search, Plus, Filter, BookOpen } from "lucide-react"

export default function BancoPreguntasView() {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl mb-2">Banco de Preguntas</h1>
            <p className="text-muted-foreground">
              Gestiona y organiza preguntas para tus exámenes
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Pregunta
          </Button>
        </div>

        <div className="mb-6 flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar preguntas..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Preguntas</p>
                <p className="text-2xl">0</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Por Materia</p>
                <p className="text-2xl">0</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Filter className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categorías</p>
                <p className="text-2xl">0</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-muted rounded-full mb-4">
              <Database className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl mb-2">No hay preguntas en el banco</h2>
            <p className="text-muted-foreground mb-6">
              Comienza creando tu primera pregunta o importa preguntas existentes
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear Primera Pregunta
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
