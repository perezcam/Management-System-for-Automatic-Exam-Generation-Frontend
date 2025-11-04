import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Wand2 } from "lucide-react"

export default function GeneradorPreguntasView() {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl mb-2">Generador de Preguntas</h1>
          <p className="text-muted-foreground">
            Genera preguntas automáticamente usando inteligencia artificial
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg mb-4 flex items-center">
              <Wand2 className="mr-2 h-5 w-5" />
              Configuración
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic">Tema o Materia</Label>
                <Input
                  id="topic"
                  placeholder="Ej: Matemáticas Avanzadas"
                />
              </div>

              <div>
                <Label htmlFor="context">Contexto o Contenido</Label>
                <Textarea
                  id="context"
                  placeholder="Proporciona el contexto o material del cual generar las preguntas..."
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="quantity">Cantidad de Preguntas</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="5"
                  defaultValue="5"
                />
              </div>

              <div>
                <Label htmlFor="type">Tipo de Pregunta</Label>
                <Input
                  id="type"
                  placeholder="Opción múltiple, Desarrollo, etc."
                />
              </div>

              <Button className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Generar Preguntas
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg mb-4">Vista Previa</h2>
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Las preguntas generadas aparecerán aquí</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
