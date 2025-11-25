"use client"

import { useState, useMemo } from "react"
import { Search, FileCheck, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ExamApprovalCard, ExamApproval } from "@/components/dashboard/pending-exams/exam-approval-card"
import { ExamDetailDialog, ExamDetail } from "@/components/dashboard/pending-exams/exam-detail-dialog"
import { ExamFiltersSheet, ExamFilters } from "@/components/dashboard/pending-exams/exam-filters-sheet"
import { showSuccess } from "@/utils/toast"
import { Button } from "@/components/ui/button"

// Mock data con exámenes completos
const mockExams: ExamDetail[] = [
  {
    id: "1",
    subject: "Estructuras de Datos",
    examName: "Examen Final",
    creator: "Prof. María García",
    createdDate: "19/11/2025",
    status: "pendiente",
    difficulty: "Mixta",
    questions: [
      {
        id: "q1",
        body: "¿Cuál es la complejidad temporal promedio del algoritmo QuickSort?",
        type: "Opción Múltiple",
        difficulty: "Regular",
        subtopic: "Ordenamiento"
      },
      {
        id: "q2",
        body: "La búsqueda binaria requiere que el arreglo esté ordenado",
        type: "Verdadero/Falso",
        difficulty: "Fácil",
        subtopic: "Búsqueda"
      },
      {
        id: "q3",
        body: "Explica la diferencia entre una lista enlazada simple y una lista doblemente enlazada",
        type: "Ensayo",
        difficulty: "Regular",
        subtopic: "Listas"
      },
      {
        id: "q4",
        body: "Describe cómo funciona el algoritmo de torres de Hanoi y su complejidad",
        type: "Ensayo",
        difficulty: "Difícil",
        subtopic: "Recursión"
      },
      {
        id: "q5",
        body: "¿Qué estructura de datos sigue el principio LIFO?",
        type: "Opción Múltiple",
        difficulty: "Fácil",
        subtopic: "Pilas"
      }
    ]
  },
  {
    id: "2",
    subject: "Base de Datos",
    examName: "Parcial 2",
    creator: "Dr. Carlos Rodríguez",
    createdDate: "19/11/2025",
    status: "pendiente",
    difficulty: "Regular",
    questions: [
      {
        id: "q6",
        body: "Explica el proceso de normalización de bases de datos hasta la tercera forma normal",
        type: "Ensayo",
        difficulty: "Regular",
        subtopic: "Normalización"
      },
      {
        id: "q7",
        body: "¿Cuál es el resultado de un INNER JOIN?",
        type: "Opción Múltiple",
        difficulty: "Regular",
        subtopic: "JOIN"
      },
      {
        id: "q8",
        body: "Las subconsultas pueden estar en la cláusula SELECT, FROM o WHERE",
        type: "Verdadero/Falso",
        difficulty: "Regular",
        subtopic: "Subconsultas"
      }
    ]
  },
  {
    id: "3",
    subject: "Programación Orientada a Objetos",
    examName: "Quiz 1",
    creator: "Prof. Ana López",
    createdDate: "18/11/2025",
    status: "aprobado",
    difficulty: "Fácil",
    questions: [
      {
        id: "q9",
        body: "Define qué es la encapsulación en POO",
        type: "Ensayo",
        difficulty: "Fácil",
        subtopic: "Conceptos Básicos"
      },
      {
        id: "q10",
        body: "La herencia permite reutilizar código de una clase padre",
        type: "Verdadero/Falso",
        difficulty: "Fácil",
        subtopic: "Herencia"
      }
    ],
    approvalComment: "Excelente examen, bien estructurado y equilibrado."
  },
  {
    id: "4",
    subject: "Redes de Computadoras",
    examName: "Examen Práctico",
    creator: "Dr. Roberto Fernández",
    createdDate: "17/11/2025",
    status: "rechazado",
    difficulty: "Difícil",
    questions: [
      {
        id: "q11",
        body: "Explica el modelo OSI y sus 7 capas",
        type: "Ensayo",
        difficulty: "Difícil",
        subtopic: "Modelos de Red"
      },
      {
        id: "q12",
        body: "¿Cuál es la diferencia entre TCP y UDP?",
        type: "Opción Múltiple",
        difficulty: "Regular",
        subtopic: "Protocolos"
      }
    ],
    rejectionComment: "El examen incluye preguntas que no fueron cubiertas en el temario del curso. Por favor, revisa las preguntas 3 y 5 para alinearlas con el contenido aprobado del syllabus."
  },
  {
    id: "5",
    subject: "Sistemas Operativos",
    examName: "Primer Parcial",
    creator: "Prof. Elena Martínez",
    createdDate: "18/11/2025",
    status: "pendiente",
    difficulty: "Mixta",
    questions: [
      {
        id: "q13",
        body: "¿Qué es un proceso en un sistema operativo?",
        type: "Opción Múltiple",
        difficulty: "Fácil",
        subtopic: "Procesos"
      },
      {
        id: "q14",
        body: "Explica el algoritmo de planificación Round Robin",
        type: "Ensayo",
        difficulty: "Regular",
        subtopic: "Planificación"
      },
      {
        id: "q15",
        body: "Describe los diferentes estados de un proceso",
        type: "Ensayo",
        difficulty: "Difícil",
        subtopic: "Procesos"
      }
    ]
  },
  {
    id: "6",
    subject: "Algoritmos y Complejidad",
    examName: "Evaluación Práctica",
    creator: "Dr. Pedro Sánchez",
    createdDate: "16/11/2025",
    status: "aprobado",
    difficulty: "Regular",
    questions: [
      {
        id: "q16",
        body: "¿Qué es la notación Big O?",
        type: "Opción Múltiple",
        difficulty: "Fácil",
        subtopic: "Complejidad"
      },
      {
        id: "q17",
        body: "Implementa un algoritmo de ordenamiento por inserción",
        type: "Ensayo",
        difficulty: "Regular",
        subtopic: "Ordenamiento"
      }
    ]
  },
  {
    id: "7",
    subject: "Ingeniería de Software",
    examName: "Examen de Metodologías",
    creator: "Prof. Carmen Vega",
    createdDate: "15/11/2025",
    status: "rechazado",
    difficulty: "Regular",
    questions: [
      {
        id: "q18",
        body: "Define qué es Scrum",
        type: "Ensayo",
        difficulty: "Fácil",
        subtopic: "Metodologías Ágiles"
      },
      {
        id: "q19",
        body: "La metodología Waterfall es más flexible que Scrum",
        type: "Verdadero/Falso",
        difficulty: "Regular",
        subtopic: "Metodologías"
      }
    ]
  },
  {
    id: "8",
    subject: "Inteligencia Artificial",
    examName: "Examen de Algoritmos",
    creator: "Dr. Luis Morales",
    createdDate: "20/11/2025",
    status: "pendiente",
    difficulty: "Difícil",
    questions: [
      {
        id: "q20",
        body: "Explica cómo funciona el algoritmo A* para búsqueda de caminos",
        type: "Ensayo",
        difficulty: "Difícil",
        subtopic: "Búsqueda"
      }
    ]
  },
  {
    id: "9",
    subject: "Seguridad Informática",
    examName: "Quiz de Criptografía",
    creator: "Prof. Sandra Torres",
    createdDate: "21/11/2025",
    status: "aprobado",
    difficulty: "Regular",
    questions: [
      {
        id: "q21",
        body: "¿Qué es el cifrado simétrico?",
        type: "Opción Múltiple",
        difficulty: "Regular",
        subtopic: "Criptografía"
      }
    ],
    approvalComment: "Perfecto balance entre teoría y práctica."
  }
]

export default function PruebasAprobarView() {
  const [exams, setExams] = useState<ExamDetail[]>(mockExams)
  const [selectedExam, setSelectedExam] = useState<ExamDetail | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  
  // Filtros temporales que no se aplican hasta presionar "Aplicar"
  const [tempFilters, setTempFilters] = useState<ExamFilters>({
    profesor: "todos",
    asignatura: "todas",
    estado: "todos",
    nombreExamen: "todos"
  })
  
  // Filtros aplicados
  const [appliedFilters, setAppliedFilters] = useState<ExamFilters>({
    profesor: "todos",
    asignatura: "todas",
    estado: "todos",
    nombreExamen: "todos"
  })

  // Extraer listas únicas para filtros
  const profesores = useMemo(() => {
    return Array.from(new Set(exams.map(e => e.creator))).sort()
  }, [exams])

  const asignaturas = useMemo(() => {
    return Array.from(new Set(exams.map(e => e.subject))).sort()
  }, [exams])

  const handleExamClick = (exam: ExamApproval) => {
    const fullExam = exams.find(e => e.id === exam.id)
    if (fullExam) {
      setSelectedExam(fullExam)
      setShowDetailDialog(true)
    }
  }

  const handleApprove = (examId: string, comment?: string) => {
    setExams(exams.map(exam => {
      if (exam.id === examId) {
        return {
          ...exam,
          status: "aprobado" as const,
          approvalComment: comment
        }
      }
      return exam
    }))
    showSuccess(
      "Examen aprobado exitosamente",
      "El examen ha sido aprobado y el profesor ha sido notificado"
    )
  }

  const handleReject = (examId: string, comment?: string) => {
    setExams(exams.map(exam => {
      if (exam.id === examId) {
        return {
          ...exam,
          status: "rechazado" as const,
          rejectionComment: comment
        }
      }
      return exam
    }))
    showSuccess(
      "Examen rechazado",
      "El profesor ha sido notificado sobre el rechazo"
    )
  }

  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters)
    setShowFiltersDialog(false)
  }

  // Filtrar exámenes usando appliedFilters en lugar de filters
  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = 
        exam.subject.toLowerCase().includes(searchLower) ||
        exam.examName.toLowerCase().includes(searchLower) ||
        exam.creator.toLowerCase().includes(searchLower)

      const matchesProfesor = appliedFilters.profesor === "todos" || exam.creator === appliedFilters.profesor
      const matchesAsignatura = appliedFilters.asignatura === "todas" || exam.subject === appliedFilters.asignatura
      const matchesEstado = appliedFilters.estado === "todos" || exam.status === appliedFilters.estado

      return matchesSearch && matchesProfesor && matchesAsignatura && matchesEstado
    })
  }, [exams, searchQuery, appliedFilters])

  // Convertir a formato de card
  const toExamCards = (examsList: ExamDetail[]): ExamApproval[] => {
    return examsList.map(exam => ({
      id: exam.id,
      subject: exam.subject,
      examName: exam.examName,
      creator: exam.creator,
      createdDate: exam.createdDate,
      totalQuestions: exam.questions.length,
      status: exam.status,
      difficulty: exam.difficulty
    }))
  }

  const examCards = toExamCards(filteredExams)

  // Usar appliedFilters para el contador
  const activeFiltersCount = Object.values(appliedFilters).filter(
    value => value !== "todos" && value !== "todas"
  ).length

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 sm:p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold mb-1">Pruebas a Aprobar</h1>
            <p className="text-sm text-muted-foreground">
              Revisa y gestiona las solicitudes de aprobación de exámenes
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por asignatura, examen o profesor..."
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
        {examCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <FileCheck className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-base sm:text-lg font-medium mb-2">No se encontraron exámenes</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {searchQuery || appliedFilters.profesor !== "todos" || appliedFilters.asignatura !== "todas" || appliedFilters.estado !== "todos"
                ? "Intenta con otros términos de búsqueda o ajusta los filtros"
                : "No hay exámenes disponibles"}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-3 pr-4">
              {examCards.map((exam) => (
                <ExamApprovalCard
                  key={exam.id}
                  exam={exam}
                  onClick={handleExamClick}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <ExamFiltersSheet
        open={showFiltersDialog}
        onOpenChange={setShowFiltersDialog}
        filters={tempFilters}
        onFiltersChange={setTempFilters}
        profesores={profesores}
        asignaturas={asignaturas}
        onApplyFilters={handleApplyFilters}
      />

      <ExamDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        exam={selectedExam}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}