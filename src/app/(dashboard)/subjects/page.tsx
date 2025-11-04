'use client';

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BookOpen, ChevronRight, Calendar, AlertCircle, TrendingUp } from "lucide-react"

interface PruebaAsignatura {
  id: string
  nombre: string
  fecha: Date
  calificacion: number
  duracion: number
  participantes: number
  puedeReclamar: boolean
}

interface Asignatura {
  id: string
  nombre: string
  codigo: string
  profesor: string
  periodo: string
  totalPruebas: number
  promedio: number
  pruebas: PruebaAsignatura[]
}

// Mock data para asignaturas
const asignaturas: Asignatura[] = [
  {
    id: "a1",
    nombre: "Matemáticas Avanzadas",
    codigo: "MAT-401",
    profesor: "Prof. María García",
    periodo: "2025-2",
    totalPruebas: 4,
    promedio: 8.5,
    pruebas: [
      {
        id: "p1",
        nombre: "Examen Final",
        fecha: new Date("2025-10-30T10:00:00"),
        calificacion: 9.0,
        duracion: 180,
        participantes: 45,
        puedeReclamar: true
      },
      {
        id: "p2",
        nombre: "Tercer Parcial",
        fecha: new Date("2025-10-15T14:00:00"),
        calificacion: 8.5,
        duracion: 120,
        participantes: 45,
        puedeReclamar: false
      },
      {
        id: "p3",
        nombre: "Segundo Parcial",
        fecha: new Date("2025-09-20T10:00:00"),
        calificacion: 8.0,
        duracion: 120,
        participantes: 46,
        puedeReclamar: false
      },
      {
        id: "p4",
        nombre: "Primer Parcial",
        fecha: new Date("2025-08-25T10:00:00"),
        calificacion: 8.5,
        duracion: 120,
        participantes: 47,
        puedeReclamar: false
      }
    ]
  },
  {
    id: "a2",
    nombre: "Química Orgánica",
    codigo: "QUI-302",
    profesor: "Prof. Ana López",
    periodo: "2025-2",
    totalPruebas: 3,
    promedio: 7.8,
    pruebas: [
      {
        id: "p5",
        nombre: "Segundo Parcial",
        fecha: new Date("2025-10-28T14:00:00"),
        calificacion: 8.2,
        duracion: 120,
        participantes: 38,
        puedeReclamar: true
      },
      {
        id: "p6",
        nombre: "Primer Parcial",
        fecha: new Date("2025-09-18T14:00:00"),
        calificacion: 7.5,
        duracion: 120,
        participantes: 40,
        puedeReclamar: false
      },
      {
        id: "p7",
        nombre: "Quiz Inicial",
        fecha: new Date("2025-08-20T14:00:00"),
        calificacion: 7.7,
        duracion: 60,
        participantes: 40,
        puedeReclamar: false
      }
    ]
  },
  {
    id: "a3",
    nombre: "Historia Universal",
    codigo: "HIS-201",
    profesor: "Dr. Carlos Rodríguez",
    periodo: "2025-2",
    totalPruebas: 3,
    promedio: 8.9,
    pruebas: [
      {
        id: "p8",
        nombre: "Segundo Parcial",
        fecha: new Date("2025-10-30T10:00:00"),
        calificacion: 9.2,
        duracion: 150,
        participantes: 42,
        puedeReclamar: true
      },
      {
        id: "p9",
        nombre: "Primer Parcial",
        fecha: new Date("2025-09-22T10:00:00"),
        calificacion: 8.8,
        duracion: 150,
        participantes: 43,
        puedeReclamar: false
      },
      {
        id: "p10",
        nombre: "Diagnóstico Inicial",
        fecha: new Date("2025-08-18T10:00:00"),
        calificacion: 8.7,
        duracion: 90,
        participantes: 44,
        puedeReclamar: false
      }
    ]
  },
  {
    id: "a4",
    nombre: "Programación Avanzada",
    codigo: "CS-405",
    profesor: "Dr. Roberto Fernández",
    periodo: "2025-2",
    totalPruebas: 5,
    promedio: 8.2,
    pruebas: [
      {
        id: "p11",
        nombre: "Proyecto Final",
        fecha: new Date("2025-10-25T11:00:00"),
        calificacion: 9.5,
        duracion: 180,
        participantes: 50,
        puedeReclamar: false
      },
      {
        id: "p12",
        nombre: "Tercer Parcial",
        fecha: new Date("2025-10-10T11:00:00"),
        calificacion: 8.0,
        duracion: 120,
        participantes: 50,
        puedeReclamar: true
      },
      {
        id: "p13",
        nombre: "Segundo Parcial",
        fecha: new Date("2025-09-15T11:00:00"),
        calificacion: 7.8,
        duracion: 120,
        participantes: 51,
        puedeReclamar: false
      },
      {
        id: "p14",
        nombre: "Primer Parcial",
        fecha: new Date("2025-08-28T11:00:00"),
        calificacion: 8.2,
        duracion: 120,
        participantes: 52,
        puedeReclamar: false
      },
      {
        id: "p15",
        nombre: "Quiz de Diagnóstico",
        fecha: new Date("2025-08-15T11:00:00"),
        calificacion: 7.5,
        duracion: 45,
        participantes: 52,
        puedeReclamar: false
      }
    ]
  },
  {
    id: "a5",
    nombre: "Literatura Española",
    codigo: "LIT-301",
    profesor: "Prof. Elena Martínez",
    periodo: "2025-2",
    totalPruebas: 3,
    promedio: 9.1,
    pruebas: [
      {
        id: "p16",
        nombre: "Análisis del Siglo de Oro",
        fecha: new Date("2025-10-28T15:00:00"),
        calificacion: 9.3,
        duracion: 120,
        participantes: 35,
        puedeReclamar: true
      },
      {
        id: "p17",
        nombre: "Parcial de Literatura Medieval",
        fecha: new Date("2025-09-25T15:00:00"),
        calificacion: 9.0,
        duracion: 120,
        participantes: 36,
        puedeReclamar: false
      },
      {
        id: "p18",
        nombre: "Ensayo Introductorio",
        fecha: new Date("2025-08-22T15:00:00"),
        calificacion: 9.0,
        duracion: 90,
        participantes: 37,
        puedeReclamar: false
      }
    ]
  }
]

function formatFecha(fecha: Date): string {
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  return `${meses[fecha.getMonth()]} ${fecha.getDate()}, ${fecha.getFullYear()}`
}

function getColorByCalificacion(calificacion: number): string {
  if (calificacion >= 9) return "text-green-600"
  if (calificacion >= 7) return "text-blue-600"
  return "text-orange-600"
}

export default function AsignaturasView() {
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState<string | null>(null)
  
  const asignaturaActual = asignaturaSeleccionada 
    ? asignaturas.find(a => a.id === asignaturaSeleccionada) 
    : null

  const handleReclamar = (pruebaId: string) => {
    console.log("Reclamo de prueba:", pruebaId)
  }

  if (asignaturaActual) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setAsignaturaSeleccionada(null)}
              className="mb-4"
            >
              ← Volver a Asignaturas
            </Button>
            
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-foreground">{asignaturaActual.nombre}</h1>
                  <Badge variant="outline">{asignaturaActual.codigo}</Badge>
                </div>
                <p className="text-muted-foreground">
                  {asignaturaActual.profesor} • {asignaturaActual.periodo}
                </p>
              </div>
              
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Promedio General</div>
                  <div className="text-3xl font-mono text-green-600">{asignaturaActual.promedio}</div>
                  <div className="text-xs text-muted-foreground mt-1">{asignaturaActual.totalPruebas} pruebas</div>
                </div>
              </Card>
            </div>

            <Separator />
          </div>

          <div>
            <h2 className="text-foreground mb-4">Historial de Pruebas</h2>
            <div className="space-y-3">
              {asignaturaActual.pruebas.map((prueba) => (
                <Card key={prueba.id} className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-foreground">{prueba.nombre}</h3>
                        {prueba.puedeReclamar && (
                          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-200 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Disponible para reclamar
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{formatFecha(prueba.fecha)}</span>
                        </div>
                        <span>Duración: {prueba.duracion} min</span>
                        <span>Participantes: {prueba.participantes}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">Calificación</div>
                        <div className={`text-3xl font-mono ${getColorByCalificacion(prueba.calificacion)}`}>
                          {prueba.calificacion}
                        </div>
                      </div>
                      
                      {prueba.puedeReclamar && (
                        <Button
                          variant="outline"
                          onClick={() => handleReclamar(prueba.id)}
                          className="border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                          Reclamar
                        </Button>
                      )}
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

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-foreground mb-1">Mis Asignaturas</h1>
          <p className="text-muted-foreground">Selecciona una asignatura para ver el historial de pruebas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {asignaturas.map((asignatura) => (
            <Card 
              key={asignatura.id} 
              className="p-5 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => setAsignaturaSeleccionada(asignatura.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="text-foreground">{asignatura.nombre}</h3>
                  </div>
                  
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{asignatura.codigo}</Badge>
                      <span className="text-sm text-muted-foreground">{asignatura.periodo}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{asignatura.profesor}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-muted-foreground">Promedio:</span>
                      <span className={`font-mono ${getColorByCalificacion(asignatura.promedio)}`}>
                        {asignatura.promedio}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {asignatura.totalPruebas} pruebas realizadas
                    </span>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
