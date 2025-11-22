import { FileEdit, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog"
import { Card } from "../../ui/card"
import { Button } from "../../ui/button"

interface ExamCreationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectManual: () => void
  onSelectAutomatic: () => void
}

export function ExamCreationDialog({
  open,
  onOpenChange,
  onSelectManual,
  onSelectAutomatic
}: ExamCreationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Añadido max-h y overflow para evitar desborde */}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Examen</DialogTitle>
          <DialogDescription>
            Selecciona el método de creación del examen
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <Card 
            className="p-6 cursor-pointer hover:border-primary transition-colors"
            onClick={onSelectManual}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <FileEdit className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Creación Manual</h3>
                <p className="text-sm text-muted-foreground">
                  Selecciona manualmente cada pregunta del examen. Controla exactamente qué preguntas incluir según tema y dificultad.
                </p>
              </div>
              <Button className="w-full">
                Crear Manualmente
              </Button>
            </div>
          </Card>
          
          <Card 
            className="p-6 cursor-pointer hover:border-primary transition-colors"
            onClick={onSelectAutomatic}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-purple-100 rounded-full">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Generación Automática</h3>
                <p className="text-sm text-muted-foreground">
                  Define parámetros y genera el examen automáticamente. Configura dificultad, tipos de preguntas y cobertura de temas.
                </p>
              </div>
              <Button className="w-full" variant="secondary">
                Generar Automáticamente
              </Button>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
