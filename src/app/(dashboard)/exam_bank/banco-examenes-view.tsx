import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileStack, Search, Plus, Filter } from "lucide-react"

export function BancoExamenesView() {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl mb-2">Banco de Exámenes</h1>
            <p className="text-muted-foreground">
              Repositorio de exámenes creados y aprobados
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Examen
          </Button>
        </div>

        <div className="mb-6 flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar exámenes..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-muted rounded-full mb-4">
              <FileStack className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl mb-2">No hay exámenes disponibles</h2>
            <p className="text-muted-foreground mb-6">
              Comienza creando o importando exámenes a tu banco
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Primer Examen
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
