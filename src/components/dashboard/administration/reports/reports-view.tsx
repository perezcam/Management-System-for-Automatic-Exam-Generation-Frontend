import { ArrowLeft, FileText } from "lucide-react"
import { Button } from "../../../ui/button"
import { Card } from "../../../ui/card"

interface ReportsViewProps {
  onBack: () => void
}

export function ReportsView({ onBack }: ReportsViewProps) {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl mb-2">Reportes</h1>
          <p className="text-muted-foreground">
            Genera y visualiza reportes del sistema
          </p>
        </div>

        <Card className="p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-lg mb-2">Función en Desarrollo</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              El módulo de reportes está actualmente en desarrollo. Pronto podrás generar y visualizar reportes detallados del sistema.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
