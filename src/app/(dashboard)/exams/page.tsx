"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Calendar, Users, BookOpen, GraduationCap, Filter, Search } from "lucide-react"
import { StudentExamFiltersDialog, StudentExamFilters } from "@/components/dashboard/exams/exam-filters-dialog"
import { ExamTakingView } from "@/components/dashboard/exams/exam-taking-view"

interface Prueba {
  id: string
  nombre: string
  asignatura: string
  fecha: string
  hora: string
  duracion: number // en minutos
  profesor: string
  estudiantes: number
  curso: string
  estado: "pendiente" | "activa" | "en-revision" | "calificada"
  calificacion?: number
}

type Question =
  | {
      id: string
      number: number
      type: "multiple-choice"
      body: string
      options: string[]
      topic: string
      subtopic: string
    }
  | {
      id: string
      number: number
      type: "true-false"
      body: string
      topic: string
      subtopic: string
    }
  | {
      id: string
      number: number
      type: "essay"
      body: string
      topic: string
      subtopic: string
    }

interface ActiveExam {
  id: string
  nombre: string
  asignatura: string
  fecha: string
  hora: string
  duracion: number
  profesor: string
  estudiantes: number
  curso: string
  questions: Question[]
}

// Mock data con pruebas variadas
const mockPruebas: Prueba[] = [
  {
    id: "1",
    nombre: "Examen Final",
    asignatura: "Estructuras de Datos",
    fecha: "25/11/2025",
    hora: "10:00",
    duracion: 180,
    profesor: "Prof. María García",
    estudiantes: 45,
    curso: "CS-301",
    estado: "pendiente"
  },
  {
    id: "2",
    nombre: "Parcial 2",
    asignatura: "Base de Datos",
    fecha: "23/11/2025",
    hora: "14:00",
    duracion: 120,
    profesor: "Dr. Carlos Rodríguez",
    estudiantes: 38,
    curso: "CS-305",
    estado: "activa"
  },
  {
    id: "3",
    nombre: "Quiz 1",
    asignatura: "Programación Orientada a Objetos",
    fecha: "20/11/2025",
    hora: "09:00",
    duracion: 60,
    profesor: "Prof. Ana López",
    estudiantes: 42,
    curso: "CS-201",
    estado: "en-revision"
  },
  {
    id: "4",
    nombre: "Examen Práctico",
    asignatura: "Redes de Computadoras",
    fecha: "18/11/2025",
    hora: "11:00",
    duracion: 150,
    profesor: "Dr. Roberto Fernández",
    estudiantes: 35,
    curso: "CS-402",
    estado: "calificada",
    calificacion: 8.5
  },
  {
    id: "5",
    nombre: "Primer Parcial",
    asignatura: "Sistemas Operativos",
    fecha: "15/11/2025",
    hora: "10:00",
    duracion: 120,
    profesor: "Prof. Elena Martínez",
    estudiantes: 40,
    curso: "CS-303",
    estado: "calificada",
    calificacion: 9.2
  },
  {
    id: "6",
    nombre: "Evaluación Práctica",
    asignatura: "Algoritmos y Complejidad",
    fecha: "10/11/2025",
    hora: "15:00",
    duracion: 90,
    profesor: "Dr. Pedro Sánchez",
    estudiantes: 37,
    curso: "CS-304",
    estado: "calificada",
    calificacion: 7.8
  },
  {
    id: "7",
    nombre: "Examen de Metodologías",
    asignatura: "Ingeniería de Software",
    fecha: "28/11/2025",
    hora: "16:00",
    duracion: 120,
    profesor: "Prof. Carmen Vega",
    estudiantes: 44,
    curso: "CS-401",
    estado: "pendiente"
  },
  {
    id: "8",
    nombre: "Examen de Algoritmos",
    asignatura: "Inteligencia Artificial",
    fecha: "30/11/2025",
    hora: "14:00",
    duracion: 150,
    profesor: "Dr. Luis Morales",
    estudiantes: 32,
    curso: "CS-501",
    estado: "pendiente"
  },
  {
    id: "9",
    nombre: "Quiz de Criptografía",
    asignatura: "Seguridad Informática",
    fecha: "12/11/2025",
    hora: "10:00",
    duracion: 60,
    profesor: "Prof. Sandra Torres",
    estudiantes: 39,
    curso: "CS-403",
    estado: "calificada",
    calificacion: 8.9
  },
  {
    id: "10",
    nombre: "Parcial 1",
    asignatura: "Compiladores",
    fecha: "22/11/2025",
    hora: "11:00",
    duracion: 120,
    profesor: "Dr. Javier Ruiz",
    estudiantes: 28,
    curso: "CS-502",
    estado: "activa"
  }
]

const getEstadoBadge = (estado: Prueba["estado"]) => {
  switch (estado) {
    case "pendiente":
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">Pendiente</Badge>
    case "activa":
      return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-200">Activa</Badge>
    case "en-revision":
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">En Revisión</Badge>
    case "calificada":
      return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">Calificada</Badge>
  }
}

const getEstadoLabel = (estado: string) => {
  switch (estado) {
    case "pendiente":
      return "Pendiente"
    case "activa":
      return "Activa"
    case "en-revision":
      return "En Revisión"
    case "calificada":
      return "Calificada"
    default:
      return estado
  }
}

// Mock questions para los exámenes activos
const mockQuestions = {
  "2": [ // Parcial 2 - Base de Datos (activa)
    {
      id: "q1",
      number: 1,
      type: "multiple-choice" as const,
      body: "¿Cuál es el resultado de un INNER JOIN entre dos tablas?",
      options: [
        "Todas las filas de ambas tablas",
        "Solo las filas que tienen coincidencias en ambas tablas",
        "Todas las filas de la tabla izquierda",
        "Todas las filas de la tabla derecha"
      ],
      topic: "SQL",
      subtopic: "JOIN"
    },
    {
      id: "q2",
      number: 2,
      type: "true-false" as const,
      body: "Las subconsultas pueden estar en la cláusula SELECT, FROM o WHERE",
      topic: "SQL",
      subtopic: "Subconsultas"
    },
    {
      id: "q3",
      number: 3,
      type: "essay" as const,
      body: "Explica el proceso de normalización de bases de datos hasta la tercera forma normal. Incluye ejemplos de cada forma normal.",
      topic: "Diseño",
      subtopic: "Normalización"
    },
    {
      id: "q4",
      number: 4,
      type: "multiple-choice" as const,
      body: "¿Qué es una clave primaria en una base de datos relacional?",
      options: [
        "Un campo que puede contener valores duplicados",
        "Un campo que identifica de forma única cada registro en una tabla",
        "Un campo que puede ser nulo",
        "Un campo que solo puede contener números"
      ],
      topic: "Diseño",
      subtopic: "Claves"
    },
    {
      id: "q5",
      number: 5,
      type: "multiple-choice" as const,
      body: "¿Qué índice es más apropiado para búsquedas por rango en una columna numérica?",
      options: [
        "Índice hash",
        "Índice B-tree",
        "Índice bitmap",
        "Índice invertido"
      ],
      topic: "SQL",
      subtopic: "Índices"
    }
  ],
  "10": [ // Parcial 1 - Compiladores (activa)
    {
      id: "q6",
      number: 1,
      type: "multiple-choice" as const,
      body: "¿Cuál es la primera fase del proceso de compilación?",
      options: [
        "Análisis semántico",
        "Análisis léxico",
        "Análisis sintáctico",
        "Generación de código"
      ],
      topic: "Fases de Compilación",
      subtopic: "Análisis Léxico"
    },
    {
      id: "q7",
      number: 2,
      type: "essay" as const,
      body: "Describe el funcionamiento de un analizador sintáctico descendente predictivo. Incluye un ejemplo de gramática y su tabla de parsing.",
      topic: "Análisis Sintáctico",
      subtopic: "Parsing"
    },
    {
      id: "q8",
      number: 3,
      type: "true-false" as const,
      body: "Una gramática ambigua puede tener múltiples árboles de derivación para una misma cadena",
      topic: "Gramáticas",
      subtopic: "Ambigüedad"
    }
  ]
}

export default function PruebasView() {
  const [pruebas] = useState<Prueba[]>(mockPruebas)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [selectedActiveExam, setSelectedActiveExam] = useState<ActiveExam | null>(null)

  // Filtros temporales que no se aplican hasta presionar "Aplicar"
  const [tempFilters, setTempFilters] = useState<StudentExamFilters>({
    estado: "todos",
    asignatura: "todas",
    profesor: "todos"
  })

  // Filtros aplicados
  const [appliedFilters, setAppliedFilters] = useState<StudentExamFilters>({
    estado: "todos",
    asignatura: "todas",
    profesor: "todos"
  })

  // Extraer listas únicas para filtros
  const asignaturas = useMemo(() => {
    return Array.from(new Set(pruebas.map(p => p.asignatura))).sort()
  }, [pruebas])

  const profesores = useMemo(() => {
    return Array.from(new Set(pruebas.map(p => p.profesor))).sort()
  }, [pruebas])

  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters)
    setShowFiltersDialog(false)
  }

  const handleExamClick = (prueba: Prueba) => {
    if (prueba.estado === "activa") {
      // Crear el objeto de examen con preguntas
      const examData = {
        id: prueba.id,
        nombre: prueba.nombre,
        asignatura: prueba.asignatura,
        fecha: prueba.fecha,
        hora: prueba.hora,
        duracion: prueba.duracion,
        profesor: prueba.profesor,
        estudiantes: prueba.estudiantes,
        curso: prueba.curso,
        questions: mockQuestions[prueba.id as keyof typeof mockQuestions] || []
      }
      setSelectedActiveExam(examData)
    }
    // No hacer nada si el examen no está activo - solo los activos son clickeables
  }

  const handleBackFromExam = () => {
    setSelectedActiveExam(null)
  }

  // Filtrar pruebas
  const filteredPruebas = useMemo(() => {
    return pruebas.filter(prueba => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = prueba.nombre.toLowerCase().includes(searchLower)

      const matchesEstado = appliedFilters.estado === "todos" || prueba.estado === appliedFilters.estado
      const matchesAsignatura = appliedFilters.asignatura === "todas" || prueba.asignatura === appliedFilters.asignatura
      const matchesProfesor = appliedFilters.profesor === "todos" || prueba.profesor === appliedFilters.profesor

      return matchesSearch && matchesEstado && matchesAsignatura && matchesProfesor
    })
  }, [pruebas, searchQuery, appliedFilters])

  const activeFiltersCount = Object.values(appliedFilters).filter(
    value => value !== "todos" && value !== "todas"
  ).length

  // Si hay un examen activo seleccionado, mostrar la vista del examen
  if (selectedActiveExam) {
    return <ExamTakingView exam={selectedActiveExam} onBack={handleBackFromExam} />
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 sm:p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold mb-1">Mis Exámenes</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona y revisa todas tus pruebas asignadas
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre del examen..."
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
        {filteredPruebas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-base sm:text-lg font-medium mb-2">No se encontraron exámenes</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {searchQuery || appliedFilters.estado !== "todos" || appliedFilters.asignatura !== "todas" || appliedFilters.profesor !== "todos"
                ? "Intenta con otros términos de búsqueda o ajusta los filtros"
                : "No hay exámenes asignados"}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4">
              {filteredPruebas.map((prueba) => (
                <Card 
                  key={prueba.id} 
                  className="p-5 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">{prueba.nombre}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {prueba.asignatura}
                              </Badge>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{prueba.curso}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {prueba.estado === "calificada" && prueba.calificacion && (
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground mb-0.5">Calificación</div>
                            <div className="text-xl font-mono text-green-600">{prueba.calificacion}</div>
                          </div>
                        )}
                        {getEstadoBadge(prueba.estado)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>{prueba.fecha} - {prueba.hora}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span>{prueba.duracion} minutos</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GraduationCap className="h-4 w-4 flex-shrink-0" />
                        <span>{prueba.profesor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span>{prueba.estudiantes} estudiantes</span>
                      </div>
                    </div>

                    {prueba.estado === "activa" && (
                      <div className="pt-3 border-t">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleExamClick(prueba)
                          }}
                          className="w-full sm:w-auto"
                        >
                          Realizar Examen
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <StudentExamFiltersDialog
        open={showFiltersDialog}
        onOpenChange={setShowFiltersDialog}
        filters={tempFilters}
        onFiltersChange={setTempFilters}
        asignaturas={asignaturas}
        profesores={profesores}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  )
}