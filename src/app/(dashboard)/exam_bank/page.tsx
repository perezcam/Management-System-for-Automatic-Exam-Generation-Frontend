"use client"

import { useState, useMemo } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ExamBankHeader } from "@/components/dashboard/exam-bank/exam-bank-header"
import { EmptyState } from "@/components/dashboard/exam-bank/empty-state"
import { ExamList } from "@/components/dashboard/exam-bank/exam-list"
import { ExamCreationDialog } from "@/components/dashboard/exam-bank/exam-creation-dialog"
import { ManualExamFormDialog } from "@/components/dashboard/exam-bank/manual-exam-form"
import { AutomaticExamFormDialog } from "@/components/dashboard/exam-bank/automatic-exam-form"
import { ExamPreviewDialog } from "@/components/dashboard/exam-bank/exam-preview-dialog"
import { DeleteExamDialog } from "@/components/dashboard/exam-bank/delete-exam-dialog"
import { ScheduleExamDialog } from "@/components/dashboard/exam-bank/schedule-exam-dialog"
import { ExamViewDialog } from "@/components/dashboard/exam-bank/exam-view-dialog"
import { ExamFiltersDialog, ExamFilters } from "@/components/dashboard/exam-bank/exam-filters-dialog"
import { 
  Exam, 
  ManualExamForm, 
  AutomaticExamForm, 
  Subject, 
  SelectedQuestion,
} from "@/components/dashboard/exam-bank/types"
import { showSuccess, showError } from "@/utils/toast"

export default function BancoExamenesView() {
  const [exams, setExams] = useState<Exam[]>([
    // Examen de ejemplo en estado "Bajo Revisión"
    {
      id: "1",
      name: "Parcial 1 - Estructuras de Datos",
      subject: "Estructuras de Datos",
      totalQuestions: 5,
      type: "manual",
      createdBy: "Mauricio Medina Hernández",
      createdAt: "21/11/2025",
      validator: "Dr. Carlos Rodríguez",
      status: "Bajo Revisión",
      questions: [
        {
          id: "q1",
          topic: "Algoritmos",
          subtopic: "Ordenamiento",
          difficulty: "Regular",
          type: "Opción Múltiple",
          body: "¿Cuál es la complejidad temporal promedio del algoritmo QuickSort?",
          options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"]
        }
      ]
    },
    // Examen de ejemplo "Aprobado"
    {
      id: "2",
      name: "Quiz - Algoritmos Básicos",
      subject: "Estructuras de Datos",
      totalQuestions: 3,
      type: "automatic",
      createdBy: "Mauricio Medina Hernández",
      createdAt: "20/11/2025",
      validator: "Prof. Ana López",
      status: "Aprobado",
      questions: [
        {
          id: "q2",
          topic: "Algoritmos",
          subtopic: "Búsqueda",
          difficulty: "Fácil",
          type: "Verdadero/Falso",
          body: "La búsqueda binaria requiere que el arreglo esté ordenado",
          options: ["Verdadero", "Falso"]
        }
      ]
    },
    // Examen de ejemplo "Rechazado"
    {
      id: "3",
      name: "Final - Base de Datos",
      subject: "Base de Datos",
      totalQuestions: 4,
      type: "manual",
      createdBy: "Mauricio Medina Hernández",
      createdAt: "19/11/2025",
      validator: "Dr. María García",
      status: "Rechazado",
      reviewComment: "El examen tiene preguntas muy complejas que no están alineadas con el contenido visto en clase. Se recomienda incluir más preguntas de nivel intermedio y ajustar las preguntas de SQL para que sean más prácticas.",
      reviewedBy: "Dr. María García",
      questions: [
        {
          id: "q3",
          topic: "Estructuras Lineales",
          subtopic: "Listas",
          difficulty: "Regular",
          type: "Ensayo",
          body: "Explica la diferencia entre una lista enlazada simple y una lista doblemente enlazada"
        }
      ]
    }
  ])
  const [showCreationDialog, setShowCreationDialog] = useState(false)
  const [showManualForm, setShowManualForm] = useState(false)
  const [showAutomaticForm, setShowAutomaticForm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [generatedQuestions, setGeneratedQuestions] = useState<SelectedQuestion[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Filtros temporales que no se aplican hasta presionar "Aplicar"
  const [tempFilters, setTempFilters] = useState<ExamFilters>({
    author: "all",
    subject: "all",
    difficulty: "all",
    status: "all"
  })
  
  // Filtros aplicados
  const [appliedFilters, setAppliedFilters] = useState<ExamFilters>({
    author: "all",
    subject: "all",
    difficulty: "all",
    status: "all"
  })
  
  const [manualForm, setManualForm] = useState<ManualExamForm>({
    name: "",
    subject: "",
    selectedQuestions: []
  })

  const [automaticForm, setAutomaticForm] = useState<AutomaticExamForm>({
    name: "",
    subject: "",
    totalQuestions: 10,
    questionTypeDistribution: [],
    difficultyDistribution: [],
    topicCoverage: [],
    subtopicDistribution: []
  })

  // Mock data - En producción vendría de una API o base de datos
  const [subjects] = useState<Subject[]>([
    {
      id: "1",
      name: "Estructuras de Datos",
      topics: [
        { id: "1", name: "Algoritmos", subtopics: ["Ordenamiento", "Búsqueda", "Recursión"] },
        { id: "2", name: "Estructuras Lineales", subtopics: ["Listas", "Pilas", "Colas"] },
        { id: "3", name: "Estructuras No Lineales", subtopics: ["Árboles", "Grafos", "Heaps"] }
      ]
    },
    {
      id: "2",
      name: "Base de Datos",
      topics: [
        { id: "4", name: "SQL", subtopics: ["SELECT", "JOIN", "Subconsultas"] },
        { id: "5", name: "Diseño", subtopics: ["Normalización", "ER", "Modelo Relacional"] }
      ]
    }
  ])


  // Mock de banco de preguntas disponibles
  const [availableQuestions] = useState<SelectedQuestion[]>([
    {
      id: "q1",
      topic: "Algoritmos",
      subtopic: "Ordenamiento",
      difficulty: "Regular",
      type: "Opción Múltiple",
      body: "¿Cuál es la complejidad temporal promedio del algoritmo QuickSort?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"]
    },
    {
      id: "q2",
      topic: "Algoritmos",
      subtopic: "Búsqueda",
      difficulty: "Fácil",
      type: "Verdadero/Falso",
      body: "La búsqueda binaria requiere que el arreglo esté ordenado",
      options: ["Verdadero", "Falso"]
    },
    {
      id: "q3",
      topic: "Estructuras Lineales",
      subtopic: "Listas",
      difficulty: "Regular",
      type: "Ensayo",
      body: "Explica la diferencia entre una lista enlazada simple y una lista doblemente enlazada"
    },
    {
      id: "q4",
      topic: "Algoritmos",
      subtopic: "Recursión",
      difficulty: "Difícil",
      type: "Ensayo",
      body: "Describe cómo funciona el algoritmo de torres de Hanoi y su complejidad"
    },
    {
      id: "q5",
      topic: "Estructuras Lineales",
      subtopic: "Pilas",
      difficulty: "Fácil",
      type: "Opción Múltiple",
      body: "¿Qué estructura de datos sigue el principio LIFO?",
      options: ["Cola", "Pila", "Lista", "Árbol"]
    },
    {
      id: "q6",
      topic: "Estructuras No Lineales",
      subtopic: "Árboles",
      difficulty: "Regular",
      type: "Opción Múltiple",
      body: "¿Cuál es la altura mínima de un árbol binario completo con 15 nodos?",
      options: ["3", "4", "5", "6"]
    },
    {
      id: "q7",
      topic: "Estructuras No Lineales",
      subtopic: "Grafos",
      difficulty: "Difícil",
      type: "Ensayo",
      body: "Explica el algoritmo de Dijkstra para encontrar el camino más corto en un grafo"
    },
    {
      id: "q8",
      topic: "Algoritmos",
      subtopic: "Ordenamiento",
      difficulty: "Fácil",
      type: "Verdadero/Falso",
      body: "El algoritmo Bubble Sort es más eficiente que QuickSort en todos los casos",
      options: ["Verdadero", "Falso"]
    }
  ])

  const handleSelectManual = () => {
    setShowCreationDialog(false)
    setIsEditMode(false)
    setSelectedExam(null)
    setManualForm({
      name: "",
      subject: "",
      selectedQuestions: []
    })
    setShowManualForm(true)
  }

  const handleSelectAutomatic = () => {
    setShowCreationDialog(false)
    setShowAutomaticForm(true)
  }

  const handleCreateManualExam = () => {
    if (manualForm.name && manualForm.subject && manualForm.selectedQuestions.length > 0) {
      const newExam: Exam = {
        id: String(Date.now()),
        name: manualForm.name,
        subject: subjects.find(s => s.id === manualForm.subject)?.name || "",
        totalQuestions: manualForm.selectedQuestions.length,
        type: "manual",
        createdBy: "Mauricio Medina Hernández",
        createdAt: new Date().toLocaleDateString('es-ES'),
        questions: manualForm.selectedQuestions,
        status: "Borrador"
      }
      
      setExams([...exams, newExam])
      setShowManualForm(false)
      setManualForm({
        name: "",
        subject: "",
        selectedQuestions: []
      })
      showSuccess("Examen creado como borrador", "El examen ha sido guardado como borrador. Puedes editarlo o enviarlo a revisión")
    } else {
      showError("Complete todos los campos", "Asegúrate de haber seleccionado al menos una pregunta")
    }
  }

  const handleGeneratePreview = () => {
    // Generar preguntas basadas en los parámetros
    const generated = generateAutomaticQuestions(automaticForm)
    
    if (generated.length === 0) {
      showError("No se pudieron generar preguntas", "No hay suficientes preguntas disponibles con los parámetros seleccionados")
      return
    }
    
    setGeneratedQuestions(generated)
    setShowAutomaticForm(false)
    setShowPreview(true)
  }

  const handleRegeneratePreview = () => {
    const regenerated = generateAutomaticQuestions(automaticForm)
    setGeneratedQuestions(regenerated)
    showSuccess("Examen regenerado", "Se ha generado una nueva versión del examen")
  }

  const handleConfirmAutomaticExam = () => {
    const newExam: Exam = {
      id: String(Date.now()),
      name: automaticForm.name,
      subject: subjects.find(s => s.id === automaticForm.subject)?.name || "",
      totalQuestions: generatedQuestions.length,
      type: "automatic",
      createdBy: "Mauricio Medina Hernández",
      createdAt: new Date().toLocaleDateString('es-ES'),
      questions: generatedQuestions,
      status: "Borrador",
    }
    
    setExams([...exams, newExam])
    setShowPreview(false)
    setAutomaticForm({
      name: "",
      subject: "",
      totalQuestions: 10,
      questionTypeDistribution: [],
      difficultyDistribution: [],
      topicCoverage: [],
      subtopicDistribution: []
    })
    setGeneratedQuestions([])
    showSuccess("Examen creado como borrador", "El examen ha sido guardado como borrador. Puedes editarlo o enviarlo a revisión")
  }

  const generateAutomaticQuestions = (form: AutomaticExamForm): SelectedQuestion[] => {
    // Filtrar preguntas según los parámetros
    let pool = availableQuestions.filter(q => {
      // Verificar que pertenezca a la cobertura de temas
      if (!form.topicCoverage.includes(q.subtopic)) return false
      
      return true
    })

    const selected: SelectedQuestion[] = []
    
    // Si hay distribución por tópicos definida, respetarla
    if (form.subtopicDistribution.length > 0 && form.subtopicDistribution.some(d => d.count > 0)) {
      for (const topicDist of form.subtopicDistribution) {
        if (topicDist.count === 0) continue
        
        // Obtener las preguntas del tópico
        const topicQuestions = pool.filter(q => q.subtopic === topicDist.subtopic)
        
        // Para cada distribución de tipo, intentar obtener la proporción correspondiente
        for (const typeDist of form.questionTypeDistribution) {
          if (typeDist.count === 0) continue
          
          // Calcular proporción para este tópico
          const proportion = topicDist.count / form.totalQuestions
          const countForTopic = Math.round(typeDist.count * proportion)
          
          const questionsOfTypeAndTopic = topicQuestions.filter(q => q.type === typeDist.type)
          
          // Seleccionar aleatoriamente
          for (let i = 0; i < countForTopic && questionsOfTypeAndTopic.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * questionsOfTypeAndTopic.length)
            const question = questionsOfTypeAndTopic[randomIndex]
            selected.push(question)
            
            // Remover del pool para no repetir
            pool = pool.filter(q => q.id !== question.id)
            questionsOfTypeAndTopic.splice(randomIndex, 1)
          }
        }
      }
    } else {
      // Si no hay distribución por tópicos, usar el algoritmo original
      for (const dist of form.questionTypeDistribution) {
        const count = dist.count
        const questionsOfType = pool.filter(q => q.type === dist.type)
        
        // Seleccionar aleatoriamente
        for (let i = 0; i < count && questionsOfType.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * questionsOfType.length)
          const question = questionsOfType[randomIndex]
          selected.push(question)
          
          // Remover del pool para no repetir
          pool = pool.filter(q => q.id !== question.id)
          questionsOfType.splice(randomIndex, 1)
        }
      }
    }

    return selected.slice(0, form.totalQuestions)
  }

  const handleViewExam = (exam: Exam) => {
    setSelectedExam(exam)
    if (exam.status === "Aprobado") {
      setShowScheduleDialog(true)
    } else {
      setShowViewDialog(true)
    }
  }

  const handleEditExam = (exam: Exam) => {
    if (exam.type === "manual" && exam.questions) {
      // Encontrar el ID de la asignatura
      const subjectId = subjects.find(s => s.name === exam.subject)?.id || ""
      
      setSelectedExam(exam)
      setIsEditMode(true)
      setManualForm({
        name: exam.name,
        subject: subjectId,
        selectedQuestions: exam.questions
      })
      setShowManualForm(true)
    }
  }

  const handleUpdateManualExam = () => {
    if (selectedExam && manualForm.name && manualForm.subject && manualForm.selectedQuestions.length > 0) {
      const updatedExam: Exam = {
        ...selectedExam,
        name: manualForm.name,
        subject: subjects.find(s => s.id === manualForm.subject)?.name || "",
        totalQuestions: manualForm.selectedQuestions.length,
        questions: manualForm.selectedQuestions,
        status: selectedExam.status === "Borrador" ? "Borrador" : "Bajo Revisión"
      }
      
      setExams(exams.map(e => e.id === selectedExam.id ? updatedExam : e))
      setShowManualForm(false)
      setIsEditMode(false)
      setSelectedExam(null)
      setManualForm({
        name: "",
        subject: "",
        selectedQuestions: []
      })
      const message = selectedExam.status === "Borrador" 
        ? "Los cambios han sido guardados en el borrador"
        : "Los cambios han sido guardados y el examen está bajo revisión nuevamente"
      showSuccess("Examen actualizado exitosamente", message)
    } else {
      showError("Complete todos los campos", "Asegúrate de haber seleccionado al menos una pregunta")
    }
  }

  const handleOpenDeleteDialog = (exam: Exam) => {
    setSelectedExam(exam)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    if (selectedExam) {
      setExams(exams.filter(e => e.id !== selectedExam.id))
      setShowDeleteDialog(false)
      setSelectedExam(null)
      showSuccess("Examen eliminado", "El examen ha sido eliminado del banco")
    }
  }

  const handleOpenScheduleDialog = (exam: Exam) => {
    setSelectedExam(exam)
    setShowScheduleDialog(true)
  }

  const handleOpenFiltersDialog = () => {
    setShowFiltersDialog(true)
  }

  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters)
    setShowFiltersDialog(false)
  }

  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      if (appliedFilters.author !== "all" && exam.createdBy !== appliedFilters.author) return false
      if (appliedFilters.subject !== "all" && exam.subject !== appliedFilters.subject) return false
      if (appliedFilters.status !== "all" && exam.status !== appliedFilters.status) return false
      if (searchQuery && !exam.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [exams, appliedFilters, searchQuery])

  // Obtener autores y asignaturas únicas para los filtros
  const availableAuthors = useMemo(() => {
    const authors = Array.from(new Set(exams.map(e => e.createdBy)))
    return authors
  }, [exams])

  const availableSubjects = useMemo(() => {
    const subj = Array.from(new Set(exams.map(e => e.subject)))
    return subj
  }, [exams])

  const handleScheduleExam = (examId: string, date: string, time: string) => {
    showSuccess("Examen programado", `El examen ha sido programado para el ${date} a las ${time}`)
    setShowScheduleDialog(false)
  }

  const handleSendToReview = (exam: Exam) => {
    if (exam.status !== "Borrador") return
    
    // Actualizar el examen a estado "Bajo Revisión"
    const updatedExam: Exam = {
      ...exam,
      status: "Bajo Revisión"
    }
    
    setExams(exams.map(e => e.id === exam.id ? updatedExam : e))
    showSuccess("Examen enviado a revisión", "El examen ha sido enviado para ser revisado por un validador")
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <ExamBankHeader onNewExam={() => setShowCreationDialog(true)} />

        <div className="mb-6 flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar exámenes..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleOpenFiltersDialog}>
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        {filteredExams.length === 0 ? (
          <EmptyState />
        ) : (
          <ExamList
            exams={filteredExams}
            onView={handleViewExam}
            onEdit={handleEditExam}
            onDelete={handleOpenDeleteDialog}
            onSchedule={handleOpenScheduleDialog}
            onSendToReview={handleSendToReview}
          />
        )}
      </div>

      <ExamCreationDialog
        open={showCreationDialog}
        onOpenChange={setShowCreationDialog}
        onSelectManual={handleSelectManual}
        onSelectAutomatic={handleSelectAutomatic}
      />

      <ManualExamFormDialog
        open={showManualForm}
        onOpenChange={setShowManualForm}
        form={manualForm}
        onFormChange={setManualForm}
        subjects={subjects}
        availableQuestions={availableQuestions}
        onSubmit={isEditMode ? handleUpdateManualExam : handleCreateManualExam}
        isEditMode={isEditMode}
      />

      <AutomaticExamFormDialog
        open={showAutomaticForm}
        onOpenChange={setShowAutomaticForm}
        form={automaticForm}
        onFormChange={setAutomaticForm}
        subjects={subjects}
        onGenerate={handleGeneratePreview}
      />

      <ExamPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        examName={automaticForm.name}
        subject={subjects.find(s => s.id === automaticForm.subject)?.name || ""}
        questions={generatedQuestions}
        availableQuestions={availableQuestions}
        subjectId={automaticForm.subject}
        subjects={subjects}
        onQuestionsChange={setGeneratedQuestions}
        onRegenerate={handleRegeneratePreview}
        onConfirm={handleConfirmAutomaticExam}
      />

      <DeleteExamDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        exam={selectedExam}
        onDelete={handleConfirmDelete}
      />

      <ScheduleExamDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        exam={selectedExam}
        onSchedule={handleScheduleExam}
      />

      <ExamFiltersDialog
        open={showFiltersDialog}
        onOpenChange={setShowFiltersDialog}
        filters={tempFilters}
        onFiltersChange={setTempFilters}
        availableAuthors={availableAuthors}
        availableSubjects={availableSubjects}
        onApplyFilters={handleApplyFilters}
      />

      <ExamViewDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        exam={selectedExam}
      />
    </div>
  )
}