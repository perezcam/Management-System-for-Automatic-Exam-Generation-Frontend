import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Clock, Calendar, Users, CheckCircle2 } from "lucide-react"

interface Prueba {
  id: string
  nombre: string
  asignatura: string
  fecha: Date
  duracion: number // en minutos
  participantes: number
  estado: "pendiente" | "finalizada"
  calificacion?: number
  descripcion: string
}

// Mock data para pruebas
const pruebasPendientes: Prueba[] = [
  {
    id: "p1",
    nombre: "Examen Final de Matemáticas Avanzadas",
    asignatura: "Matemáticas Avanzadas",
    fecha: new Date("2025-11-05T10:00:00"),
    duracion: 180,
    participantes: 45,
    estado: "pendiente",
    descripcion: "Examen final que cubre álgebra lineal, cálculo multivariable y ecuaciones diferenciales."
  },
  {
    id: "p2",
    nombre: "Parcial de Química Orgánica",
    asignatura: "Química Orgánica",
    fecha: new Date("2025-11-06T14:00:00"),
    duracion: 120,
    participantes: 38,
    estado: "pendiente",
    descripcion: "Evaluación de reacciones orgánicas, nomenclatura y mecanismos de reacción."
  },
  {
    id: "p3",
    nombre: "Quiz de Física Cuántica",
    asignatura: "Física Cuántica",
    fecha: new Date("2025-11-08T09:00:00"),
    duracion: 60,
    participantes: 32,
    estado: "pendiente",
    descripcion: "Evaluación corta sobre principios fundamentales de mecánica cuántica."
  }
]

const pruebasRealizadas: Prueba[] = [
  {
    id: "r1",
    nombre: "Examen de Historia Universal - Segundo Parcial",
    asignatura: "Historia Universal",
    fecha: new Date("2025-10-30T10:00:00"),
    duracion: 150,
    participantes: 42,
    estado: "finalizada",
    calificacion: 8.5,
    descripcion: "Evaluación sobre la Segunda Guerra Mundial y sus consecuencias."
  },
  {
    id: "r2",
    nombre: "Prueba de Literatura Española",
    asignatura: "Literatura Española",
    fecha: new Date("2025-10-28T15:00:00"),
    duracion: 120,
    participantes: 35,
    estado: "finalizada",
    calificacion: 9.2,
    descripcion: "Análisis de textos del Siglo de Oro español."
  },
  {
    id: "r3",
    nombre: "Examen de Programación Avanzada",
    asignatura: "Programación Avanzada",
    fecha: new Date("2025-10-25T11:00:00"),
    duracion: 180,
    participantes: 50,
    estado: "finalizada",
    calificacion: 7.8,
    descripcion: "Implementación de algoritmos y estructuras de datos complejas."
  },
  {
    id: "r4",
    nombre: "Quiz de Bases de Datos",
    asignatura: "Bases de Datos",
    fecha: new Date("2025-10-22T16:00:00"),
    duracion: 45,
    participantes: 40,
    estado: "finalizada",
    calificacion: 8.9,
    descripcion: "Consultas SQL y diseño de esquemas relacionales."
  },
  {
    id: "r5",
    nombre: "Parcial de Redes de Computadoras",
    asignatura: "Redes de Computadoras",
    fecha: new Date("2025-10-20T10:00:00"),
    duracion: 120,
    participantes: 38,
    estado: "finalizada",
    calificacion: 8.3,
    descripcion: "Protocolos TCP/IP y arquitecturas de red."
  }
]

function formatFecha(fecha: Date): string {
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  return `${meses[fecha.getMonth()]} ${fecha.getDate()}, ${fecha.getFullYear()}`
}

function formatHora(fecha: Date): string {
  const horas = fecha.getHours().toString().padStart(2, '0')
  const minutos = fecha.getMinutes().toString().padStart(2, '0')
  return `${horas}:${minutos}`
}

export default function PruebasView() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Pruebas Pendientes */}
        <div>
          <div className="mb-4">
            <h2 className="text-foreground mb-1">Pruebas Pendientes</h2>
            <p className="text-muted-foreground">Exámenes programados para realizar</p>
          </div>
          
          {pruebasPendientes.length > 0 ? (
            <div className="space-y-3">
              {pruebasPendientes.map((prueba) => (
                <Card key={prueba.id} className="p-5 hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="text-foreground mb-1">{prueba.nombre}</h3>
                          <p className="text-muted-foreground text-sm">{prueba.descripcion}</p>
                        </div>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                          Pendiente
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{formatFecha(prueba.fecha)} - {formatHora(prueba.fecha)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{prueba.duracion} min</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          <span>{prueba.participantes} estudiantes</span>
                        </div>
                      </div>
                      
                      <div>
                        <Badge variant="secondary" className="text-xs">
                          {prueba.asignatura}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay pruebas pendientes por realizar</p>
              </div>
            </Card>
          )}
        </div>

        <Separator />

        {/* Pruebas Realizadas */}
        <div>
          <div className="mb-4">
            <h2 className="text-foreground mb-1">Pruebas Realizadas</h2>
            <p className="text-muted-foreground">Historial de exámenes finalizados</p>
          </div>
          
          <div className="space-y-3">
            {pruebasRealizadas.map((prueba) => (
              <Card key={prueba.id} className="p-5 hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="text-foreground mb-1">{prueba.nombre}</h3>
                        <p className="text-muted-foreground text-sm">{prueba.descripcion}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground mb-0.5">Calificación</div>
                          <div className="text-2xl font-mono text-green-600">{prueba.calificacion}</div>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                          Finalizada
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{formatFecha(prueba.fecha)} - {formatHora(prueba.fecha)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{prueba.duracion} min</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>{prueba.participantes} estudiantes</span>
                      </div>
                    </div>
                    
                    <div>
                      <Badge variant="secondary" className="text-xs">
                        {prueba.asignatura}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
