'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, Settings } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import { UserManagementHeader } from "@/components/dashboard/administration/users/user-management-header"
import { UserRegistrationForm } from "@/components/dashboard/administration/users/user-registration-form"
import { UserList } from "@/components/dashboard/administration/users/user-list"

import { QuestionsConfigHeader } from "@/components/dashboard/administration/questions/questions-config-header"
import { QuestionTypeForm } from "@/components/dashboard/administration/questions/question-type-form"
import { QuestionTypeList } from "@/components/dashboard/administration/questions/question-type-list"
import { SubjectsTopicsManagement } from "@/components/dashboard/administration/questions/subjects-topics-management"

import { ReportsView } from "@/components/dashboard/administration/reports/reports-view"
import { useAdminUsers } from "@/hooks/administration/users/admin"
import { useStudentUsers } from "@/hooks/administration/users/student"
import { useTeacherUsers } from "@/hooks/administration/users/teacher"
import { useQuestionAdministration } from "@/hooks/administration/questions/use-question-administration"

export default function AdministracionView() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // Datos de usuarios desde el backend
  const {
    admins,
    loading: adminsLoading,
    error: adminsError,
    refresh: refreshAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
  } = useAdminUsers()

  const {
    students,
    loading: studentsLoading,
    error: studentsError,
    refresh: refreshStudents,
    createStudent,
    updateStudent,
    deleteStudent,
  } = useStudentUsers()

  const {
    teachers,
    loading: teachersLoading,
    error: teachersError,
    refresh: refreshTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
  } = useTeacherUsers()

  const users = useMemo(() => [...admins, ...students, ...teachers], [admins, students, teachers])
  const usersLoading = adminsLoading || studentsLoading || teachersLoading
  const usersError = adminsError ?? studentsError ?? teachersError
  const refreshUsers = useCallback(async () => {
    await Promise.all([refreshAdmins(), refreshStudents(), refreshTeachers()])
  }, [refreshAdmins, refreshStudents, refreshTeachers])

  const {
    questionTypes,
    subjects,
    topics,
    totals,
    loading: questionsLoading,
    error: questionsError,
    refresh: refreshQuestionConfig,
    createQuestionType,
    deleteQuestionType,
    createSubject,
    updateSubject,
    deleteSubject,
    createTopic,
    updateTopic,
    deleteTopic,
    createSubtopic,
    deleteSubtopic,
  } = useQuestionAdministration()

  // Vista de Gestión de Usuarios
  if (activeSection === "users") {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <UserManagementHeader onBack={() => setActiveSection(null)} />

          {usersError && (
            <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <div className="flex items-center justify-between gap-4">
                <span>Error al cargar usuarios: {usersError.message}</span>
                <Button variant="outline" size="sm" onClick={refreshUsers}>
                  Reintentar
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario de Registro */}
            <div className="lg:col-span-1">
              <UserRegistrationForm 
                subjects={subjects.map((s) => ({ id: s.subject_id, name: s.subject_name }))}
                onCreateAdmin={createAdmin}
                onCreateStudent={createStudent}
                onCreateTeacher={createTeacher}
              />
            </div>

            {/* Lista de Usuarios */}
            <div className="lg:col-span-2">
              {usersLoading ? (
                <Card className="p-6 flex items-center justify-center text-sm text-muted-foreground h-full">
                  Cargando usuarios...
                </Card>
              ) : (
                <UserList 
                  users={users}
                  subjects={subjects.map((s) => ({ id: s.subject_id, name: s.subject_name }))}
                  onUpdateAdmin={updateAdmin}
                  onUpdateStudent={updateStudent}
                  onUpdateTeacher={updateTeacher}
                  onDeleteAdmin={deleteAdmin}
                  onDeleteStudent={deleteStudent}
                  onDeleteTeacher={deleteTeacher}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Vista de Configuración de Preguntas
  if (activeSection === "questions-config") {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <QuestionsConfigHeader 
            onBack={() => setActiveSection(null)}
            stats={{
              totalTypes: totals.total_question_types,
              totalSubjects: totals.total_subjects,
              totalTopics: totals.total_topics,
              totalSubtopics: totals.total_subtopics
            }}
          />

          {questionsError && (
            <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <div className="flex items-center justify-between gap-4">
                <span>Error al cargar la configuración de preguntas: {questionsError.message}</span>
                <Button variant="outline" size="sm" onClick={refreshQuestionConfig}>
                  Reintentar
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario de Tipos de Preguntas */}
            <div className="lg:col-span-1">
              <QuestionTypeForm onCreateType={createQuestionType} />
            </div>

            {/* Lista de Tipos de Preguntas */}
            <div className="lg:col-span-2">
              <QuestionTypeList 
                questionTypes={questionTypes}
                onDeleteType={deleteQuestionType}
              />
            </div>
          </div>

          {/* Gestión de Materias, Tópicos y Subtópicos */}
          <SubjectsTopicsManagement
            subjects={subjects}
            topics={topics}
            loading={questionsLoading}
            onCreateSubject={createSubject}
            onUpdateSubject={updateSubject}
            onDeleteSubject={deleteSubject}
            onCreateTopic={createTopic}
            onUpdateTopic={updateTopic}
            onDeleteTopic={deleteTopic}
            onCreateSubtopic={createSubtopic}
            onDeleteSubtopic={deleteSubtopic}
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
