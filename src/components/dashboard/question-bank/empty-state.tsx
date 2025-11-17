import { Database } from "lucide-react"
import { Card } from "../../ui/card"

export function EmptyState() {
  return (
    <Card className="p-8 text-center">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="p-4 bg-muted rounded-full mb-4">
          <Database className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-xl mb-2">No hay preguntas en el banco</h2>
        <p className="text-muted-foreground">
          Comienza creando tu primera pregunta o importa preguntas existentes
        </p>
      </div>
    </Card>
  )
}
