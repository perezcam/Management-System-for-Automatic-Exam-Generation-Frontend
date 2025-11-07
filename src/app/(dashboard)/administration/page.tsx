import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, Settings } from "lucide-react"
import { useState } from "react"

import { UserManagementHeader } from "@/components/dashboard/administration/users/user-management-header"
import { UserRegistrationForm, type User } from "@/components/dashboard/administration/users/user-registration-form"
import { UserList } from "@/components/dashboard/administration/users/user-list"

// Importar componentes de Configuración de Preguntas
import { QuestionsConfigHeader } from "@/components/dashboard/administration/questions/questions-config-header"
import { QuestionTypeForm, type QuestionType } from "@/components/dashboard/administration/questions/question-type-form"
import { QuestionTypeList } from "@/components/dashboard/administration/questions/question-type-list"
import { SubjectsTopicsManagement, type Subject, type Topic } from "@/components/dashboard/administration/questions/subjects-topics-management"

// Importar componente de Reportes
import { ReportsView } from "@/components/dashboard/administration/reports/reports-view"

export function AdministracionView() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // Estados para gestión de usuarios
  const [users, setUsers] = useState<User[]>([
    { id: "1", username: "mmedina", email: "mauricio.medina@universidad.edu", role: "Administrador" },
    { id: "2", username: "csilva", email: "carmen.silva@universidad.edu", role: "Profesor", nombre: "Carmen Silva", especialidad: "Matemáticas", rolesProfesor: ["Examinador"] },
    { id: "3", username: "jlopez", email: "juan.lopez@universidad.edu", role: "Estudiante", nombre: "Juan López", edad: 22, curso: "3er Año" },
    { id: "4", username: "agarcia", email: "ana.garcia@universidad.edu", role: "Profesor", nombre: "Ana García", especialidad: "Física", rolesProfesor: ["Jefe de Asignatura"] },
    { id: "5", username: "rmartinez", email: "roberto.martinez@universidad.edu", role: "Profesor", nombre: "Roberto Martínez", especialidad: "Computación", rolesProfesor: ["Examinador", "Jefe de Asignatura"] },
  ])

  // Estados para configuración de preguntas
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
    { id: "1", name: "Ensayo" },
    { id: "2", name: "Opción Múltiple" },
    { id: "3", name: "Verdadero/Falso" }
  ])
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: "1", name: "Ciencia de la Computación", programa: "Licenciatura en Computación" },
    { id: "2", name: "Matemáticas Discretas", programa: "Licenciatura en Computación" }
  ])
  const [topics, setTopics] = useState<Topic[]>([
    { id: "1", name: "Algoritmos", subjectId: "1", subtopics: ["Ordenamiento", "Búsqueda", "Recursión"] },
    { id: "2", name: "Estructuras de Datos", subjectId: "1", subtopics: ["Listas", "Árboles", "Grafos"] }
  ])

  // Funciones para gestión de usuarios
  const handleCreateUser = (user: User) => {
    setUsers([...users, user])
  }

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u))
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId))
  }

  // Funciones para gestión de tipos de preguntas
  const handleCreateType = (type: QuestionType) => {
    setQuestionTypes([...questionTypes, type])
  }

  const handleDeleteType = (typeId: string) => {
    setQuestionTypes(questionTypes.filter(t => t.id !== typeId))
  }

  // Funciones para gestión de materias
  const handleCreateSubject = (subject: Subject) => {
    setSubjects([...subjects, subject])
  }

  const handleDeleteSubject = (subjectId: string) => {
    setSubjects(subjects.filter(s => s.id !== subjectId))
  }

  // Funciones para gestión de tópicos
  const handleCreateTopic = (topic: Topic) => {
    setTopics([...topics, topic])
  }

  const handleDeleteTopic = (topicId: string) => {
    setTopics(topics.filter(t => t.id !== topicId))
  }

  const handleAddSubtopic = (topicId: string, subtopic: string) => {
    setTopics(topics.map(t =>
      t.id === topicId
        ? { ...t, subtopics: [...t.subtopics, subtopic] }
        : t
    ))
  }

  const handleDeleteSubtopic = (topicId: string, subtopic: string) => {
    setTopics(topics.map(t =>
      t.id === topicId
        ? { ...t, subtopics: t.subtopics.filter(s => s !== subtopic) }
        : t
    ))
  }

  // Vista de Gestión de Usuarios
  if (activeSection === "users") {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <UserManagementHeader onBack={() => setActiveSection(null)} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario de Registro */}
            <div className="lg:col-span-1">
              <UserRegistrationForm onCreateUser={handleCreateUser} />
            </div>

            {/* Lista de Usuarios */}
            <div className="lg:col-span-2">
              <UserList 
                users={users}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Vista de Configuración de Preguntas
  if (activeSection === "questions-config") {
    // Calcular totales para estadísticas
    const totalSubtopics = topics.reduce((sum, topic) => sum + topic.subtopics.length, 0)
    
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <QuestionsConfigHeader 
            onBack={() => setActiveSection(null)}
            stats={{
              totalTypes: questionTypes.length,
              totalSubjects: subjects.length,
              totalTopics: topics.length,
              totalSubtopics: totalSubtopics
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario de Tipos de Preguntas */}
            <div className="lg:col-span-1">
              <QuestionTypeForm onCreateType={handleCreateType} />
            </div>

            {/* Lista de Tipos de Preguntas */}
            <div className="lg:col-span-2">
              <QuestionTypeList 
                questionTypes={questionTypes}
                onDeleteType={handleDeleteType}
              />
            </div>
          </div>

          {/* Gestión de Materias, Tópicos y Subtópicos */}
          <SubjectsTopicsManagement
            subjects={subjects}
            topics={topics}
            onCreateSubject={handleCreateSubject}
            onDeleteSubject={handleDeleteSubject}
            onCreateTopic={handleCreateTopic}
            onDeleteTopic={handleDeleteTopic}
            onAddSubtopic={handleAddSubtopic}
            onDeleteSubtopic={handleDeleteSubtopic}
          />
        </div>
      </div>
    )
  }

  // Vista de Reportes
  if (activeSection === "reports") {
    return <ReportsView onBack={() => setActiveSection(null)} />
  }

  // Vista principal de administración
  const adminSections = [
    {
      title: "Gestión de Usuarios",
      description: "Administra profesores, coordinadores y permisos",
      icon: Users,
      color: "blue",
      action: () => setActiveSection("users")
    },
    {
      title: "Configuración de Preguntas",
      description: "Gestiona tipos de preguntas, tópicos y subtópicos",
      icon: Settings,
      color: "purple",
      action: () => setActiveSection("questions-config")
    },
    {
      title: "Reportes",
      description: "Genera y visualiza reportes del sistema",
      icon: FileText,
      color: "orange",
      action: () => setActiveSection("reports")
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl mb-2">Administración</h1>
          <p className="text-muted-foreground">
            Panel de control y configuración del sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminSections.map((section, index) => {
            const Icon = section.icon
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex flex-col items-start">
                  <div className={`p-3 rounded-lg mb-4 ${getColorClasses(section.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg mb-2">{section.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                  <Button variant="outline" size="sm" className="mt-auto" onClick={section.action}>
                    Configurar
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
