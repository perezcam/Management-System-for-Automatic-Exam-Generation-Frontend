"use client"

import { useState, useMemo } from "react"
import { Search, ClipboardList, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { RevisionCard, RevisionData } from "@/components/dashboard/regrade/revision-card"
import { RevisionFiltersDialog } from "@/components/dashboard/regrade/revision-filters-dialog"
import { RevisionGradingView } from "@/components/dashboard/regrade/revision-grading-view"

export interface RevisionFilters {
  alumno: string
  asignatura: string
  estado: string
  nombrePrueba: string
}

// Mock data de revisiones de exámenes de estudiantes
const mockRevisiones: RevisionData[] = [
  {
    id: "r1",
    nombrePrueba: "Examen Final",
    asignatura: "Estructuras de Datos",
    alumno: "Juan Carlos Pérez González",
    fecha: "20/11/2025",
    estado: "pendiente",
    totalPreguntas: 10,
    preguntas: [
      {
        id: "q1",
        numero: 1,
        enunciado: "¿Cuál es la complejidad temporal promedio del algoritmo QuickSort?",
        tipo: "Opción Múltiple",
        opciones: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
        respuestaAlumno: ["O(n log n)"],
        respuestaEsperada: ["O(n log n)"],
        puntuacionMaxima: 2,
        puntuacionObtenida: null
      },
      {
        id: "q2",
        numero: 2,
        enunciado: "La búsqueda binaria requiere que el arreglo esté ordenado",
        tipo: "Verdadero/Falso",
        opciones: ["Verdadero", "Falso"],
        respuestaAlumno: ["Verdadero"],
        respuestaEsperada: ["Verdadero"],
        puntuacionMaxima: 1,
        puntuacionObtenida: null
      },
      {
        id: "q3",
        numero: 3,
        enunciado: "Explica la diferencia entre una lista enlazada simple y una lista doblemente enlazada",
        tipo: "Ensayo",
        respuestaAlumno: ["Una lista enlazada simple tiene nodos que apuntan solo al siguiente nodo, mientras que una lista doblemente enlazada tiene nodos que apuntan tanto al siguiente como al anterior nodo. Esto permite recorrer la lista en ambas direcciones."],
        respuestaEsperada: ["Una lista enlazada simple tiene nodos con un solo puntero que apunta al siguiente nodo. Una lista doblemente enlazada tiene nodos con dos punteros: uno al siguiente y otro al anterior, permitiendo navegación bidireccional."],
        puntuacionMaxima: 3,
        puntuacionObtenida: null
      }
    ]
  },
  {
    id: "r2",
    nombrePrueba: "Parcial 2",
    asignatura: "Base de Datos",
    alumno: "María Fernanda Rodríguez Silva",
    fecha: "20/11/2025",
    estado: "pendiente",
    totalPreguntas: 8,
    preguntas: [
      {
        id: "q1",
        numero: 1,
        enunciado: "Explica el proceso de normalización de bases de datos hasta la tercera forma normal",
        tipo: "Ensayo",
        respuestaAlumno: ["La normalización es un proceso para organizar datos. La 1FN elimina grupos repetidos, la 2FN elimina dependencias parciales y la 3FN elimina dependencias transitivas."],
        respuestaEsperada: ["1FN: Eliminar grupos repetidos y garantizar atomicidad. 2FN: Cumplir 1FN y eliminar dependencias parciales de la clave primaria. 3FN: Cumplir 2FN y eliminar dependencias transitivas entre atributos no clave."],
        puntuacionMaxima: 5,
        puntuacionObtenida: null
      }
    ]
  },
  {
    id: "r3",
    nombrePrueba: "Quiz 1",
    asignatura: "Programación Orientada a Objetos",
    alumno: "Carlos Alberto Martínez López",
    fecha: "19/11/2025",
    estado: "revisado",
    totalPreguntas: 5,
    calificacionTotal: 8.5,
    preguntas: [
      {
        id: "q1",
        numero: 1,
        enunciado: "Define qué es la encapsulación en POO",
        tipo: "Ensayo",
        respuestaAlumno: ["La encapsulación es ocultar los datos internos de una clase y solo permitir acceso mediante métodos públicos."],
        respuestaEsperada: ["La encapsulación es el principio de ocultar los detalles de implementación interna de una clase y exponer solo una interfaz pública controlada mediante métodos públicos."],
        puntuacionMaxima: 3,
        puntuacionObtenida: 2.5
      }
    ]
  },
  {
    id: "r4",
    nombrePrueba: "Examen Práctico",
    asignatura: "Redes de Computadoras",
    alumno: "Ana Patricia Sánchez Vega",
    fecha: "19/11/2025",
    estado: "reclamado",
    totalPreguntas: 12,
    calificacionTotal: 6.0,
    comentarioReclamacion: "Creo que mi respuesta sobre el modelo OSI merece más puntos, incluí todas las capas y sus funciones principales.",
    preguntas: [
      {
        id: "q1",
        numero: 1,
        enunciado: "Explica el modelo OSI y sus 7 capas",
        tipo: "Ensayo",
        respuestaAlumno: ["El modelo OSI tiene 7 capas: Física, Enlace, Red, Transporte, Sesión, Presentación y Aplicación. Cada capa tiene funciones específicas para la comunicación de red."],
        respuestaEsperada: ["El modelo OSI consta de 7 capas: 1) Física (transmisión de bits), 2) Enlace de datos (frames y direccionamiento MAC), 3) Red (routing y direccionamiento IP), 4) Transporte (segmentación y control de flujo), 5) Sesión (establecimiento de sesiones), 6) Presentación (formato de datos), 7) Aplicación (servicios de red para aplicaciones)."],
        puntuacionMaxima: 5,
        puntuacionObtenida: 2
      }
    ]
  },
  {
    id: "r5",
    nombrePrueba: "Primer Parcial",
    asignatura: "Sistemas Operativos",
    alumno: "Roberto Miguel Torres Ramírez",
    fecha: "21/11/2025",
    estado: "pendiente",
    totalPreguntas: 15,
    preguntas: [
      {
        id: "q1",
        numero: 1,
        enunciado: "¿Qué es un proceso en un sistema operativo?",
        tipo: "Opción Múltiple",
        opciones: ["Un programa en ejecución", "Un archivo ejecutable", "Una función del kernel", "Un driver de dispositivo"],
        respuestaAlumno: ["Un programa en ejecución"],
        respuestaEsperada: ["Un programa en ejecución"],
        puntuacionMaxima: 2,
        puntuacionObtenida: null
      }
    ]
  },
  {
    id: "r6",
    nombrePrueba: "Evaluación Práctica",
    asignatura: "Algoritmos y Complejidad",
    alumno: "Laura Beatriz Hernández Castro",
    fecha: "18/11/2025",
    estado: "revisado",
    totalPreguntas: 6,
    calificacionTotal: 9.0,
    preguntas: []
  },
  {
    id: "r7",
    nombrePrueba: "Examen de Metodologías",
    asignatura: "Ingeniería de Software",
    alumno: "Diego Fernando Morales Díaz",
    fecha: "17/11/2025",
    estado: "reclamado",
    totalPreguntas: 8,
    calificacionTotal: 7.5,
    comentarioReclamacion: "Mi definición de Scrum incluye todos los elementos clave. Solicito revisión de la pregunta 1.",
    preguntas: []
  },
  {
    id: "r8",
    nombrePrueba: "Examen de Algoritmos",
    asignatura: "Inteligencia Artificial",
    alumno: "Sofía Gabriela Ruiz Flores",
    fecha: "21/11/2025",
    estado: "pendiente",
    totalPreguntas: 10,
    preguntas: []
  }
]

export default function RevisionesView() {
  const [revisiones, setRevisiones] = useState<RevisionData[]>(mockRevisiones)
  const [selectedRevision, setSelectedRevision] = useState<RevisionData | null>(null)
  const [showGradingView, setShowGradingView] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  
  // Filtros temporales que no se aplican hasta presionar "Aplicar"
  const [tempFilters, setTempFilters] = useState<RevisionFilters>({
    alumno: "todos",
    asignatura: "todas",
    estado: "todos",
    nombrePrueba: "todos"
  })
  
  // Filtros aplicados
  const [appliedFilters, setAppliedFilters] = useState<RevisionFilters>({
    alumno: "todos",
    asignatura: "todas",
    estado: "todos",
    nombrePrueba: "todos"
  })

  // Extraer listas únicas para filtros
  const alumnos = useMemo(() => {
    return Array.from(new Set(revisiones.map(r => r.alumno))).sort()
  }, [revisiones])

  const asignaturas = useMemo(() => {
    return Array.from(new Set(revisiones.map(r => r.asignatura))).sort()
  }, [revisiones])

  const nombresPruebas = useMemo(() => {
    return Array.from(new Set(revisiones.map(r => r.nombrePrueba))).sort()
  }, [revisiones])

  const handleRevisionClick = (revision: RevisionData) => {
    if (revision.estado === "pendiente" || revision.estado === "reclamado") {
      setSelectedRevision(revision)
      setShowGradingView(true)
    }
  }

  const handleSaveGrading = (revisionId: string, preguntasCalificadas: RevisionData["preguntas"], calificacionTotal: number) => {
    setRevisiones(revisiones.map(rev => {
      if (rev.id === revisionId) {
        return {
          ...rev,
          estado: "revisado" as const,
          calificacionTotal,
          preguntas: preguntasCalificadas
        }
      }
      return rev
    }))
    setShowGradingView(false)
    setSelectedRevision(null)
  }

  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters)
    setShowFiltersDialog(false)
  }

  // Filtrar revisiones
  const filteredRevisiones = useMemo(() => {
    return revisiones.filter(revision => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = 
        revision.alumno.toLowerCase().includes(searchLower) ||
        revision.nombrePrueba.toLowerCase().includes(searchLower) ||
        revision.asignatura.toLowerCase().includes(searchLower)

      const matchesAlumno = appliedFilters.alumno === "todos" || revision.alumno === appliedFilters.alumno
      const matchesAsignatura = appliedFilters.asignatura === "todas" || revision.asignatura === appliedFilters.asignatura
      const matchesEstado = appliedFilters.estado === "todos" || revision.estado === appliedFilters.estado
      const matchesPrueba = appliedFilters.nombrePrueba === "todos" || revision.nombrePrueba === appliedFilters.nombrePrueba

      return matchesSearch && matchesAlumno && matchesAsignatura && matchesEstado && matchesPrueba
    })
  }, [revisiones, searchQuery, appliedFilters])

  // Contador de filtros activos
  const activeFiltersCount = Object.values(appliedFilters).filter(
    value => value !== "todos" && value !== "todas"
  ).length

  if (showGradingView && selectedRevision) {
    return (
      <RevisionGradingView
        revision={selectedRevision}
        onBack={() => {
          setShowGradingView(false)
          setSelectedRevision(null)
        }}
        onSave={handleSaveGrading}
      />
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 sm:p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold mb-1">Revisiones</h1>
            <p className="text-sm text-muted-foreground">
              Revisa y califica los exámenes completados por los estudiantes
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por alumno, asignatura o examen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowFiltersDialog(true)}
            className="w-full sm:w-auto relative"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4 sm:p-6">
        {filteredRevisiones.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <ClipboardList className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-base sm:text-lg font-medium mb-2">No se encontraron revisiones</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {searchQuery || activeFiltersCount > 0
                ? "Intenta con otros términos de búsqueda o ajusta los filtros"
                : "No hay revisiones disponibles"}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-3 pr-4">
              {filteredRevisiones.map((revision) => (
                <RevisionCard
                  key={revision.id}
                  revision={revision}
                  onClick={handleRevisionClick}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <RevisionFiltersDialog
        open={showFiltersDialog}
        onOpenChange={setShowFiltersDialog}
        filters={tempFilters}
        onFiltersChange={setTempFilters}
        alumnos={alumnos}
        asignaturas={asignaturas}
        nombresPruebas={nombresPruebas}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  )
}