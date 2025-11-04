import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Plus, Save } from "lucide-react"

export default function GeneradorExamenesView() {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl mb-2">Generador de Exámenes</h1>
            <p className="text-muted-foreground">
              Crea exámenes completos combinando preguntas del banco
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Guardar Borrador
            </Button>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Crear Examen
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg mb-4">Información del Examen</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="exam-title">Título del Examen</Label>
                  <Input
                    id="exam-title"
                    placeholder="Ej: Examen Final de Matemáticas"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course">Curso</Label>
                    <Input
                      id="course"
                      placeholder="Seleccionar curso"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duración (minutos)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="120"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="instructions">Instrucciones</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Instrucciones generales para el examen..."
                    rows={3}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg">Preguntas</h2>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Pregunta
                </Button>
              </div>

              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay preguntas agregadas</p>
                <p className="text-sm mt-2">Haz clic en Agregar Pregunta para comenzar</p>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6">
              <h2 className="text-lg mb-4">Resumen</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de preguntas:</span>
                  <span>0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Puntaje total:</span>
                  <span>0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duración:</span>
                  <span>- min</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm mb-3">Distribución por tipo</h3>
                <div className="text-sm text-muted-foreground">
                  <p>Sin preguntas</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
