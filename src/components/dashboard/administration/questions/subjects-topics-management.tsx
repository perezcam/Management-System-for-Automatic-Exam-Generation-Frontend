import { useMemo, useState } from "react"
import { Plus, Trash2, GraduationCap, FolderTree, BookOpen, Search, Edit2, Loader2 } from "lucide-react"

import { Card } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../ui/alert-dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import { CreateSubjectPayload, SubjectDetail, UpdateSubjectPayload } from "@/types/question-administration/subject"
import { CreateTopicPayload, TopicDetail, UpdateTopicPayload } from "@/types/question-administration/topic"
import { CreateSubtopicPayload, SubTopicDetail } from "@/types/question-administration/subtopic"


interface SubjectsTopicsManagementProps {
  subjects: SubjectDetail[]
  allSubjects?: SubjectDetail[]
  topics: TopicDetail[]
  allTopics?: TopicDetail[]
  loading?: boolean
  subjectsPage?: number
  subjectsPageSize?: number
  subjectsTotal?: number | null
  topicsPage?: number
  topicsPageSize?: number
  topicsTotal?: number | null
  onChangeSubjectsPage?: (page: number) => void
  onChangeTopicsPage?: (page: number) => void
  subjectsFilter?: string
  topicsFilter?: string
  onChangeSubjectsFilter?: (value: string) => void
  onChangeTopicsFilter?: (value: string) => void
  onCreateSubject: (payload: CreateSubjectPayload) => Promise<void>
  onUpdateSubject: (subjectId: string, payload: UpdateSubjectPayload) => Promise<void>
  onDeleteSubject: (subjectId: string) => Promise<void>
  onCreateTopic: (payload: CreateTopicPayload) => Promise<void>
  onUpdateTopic: (topicId: string, payload: UpdateTopicPayload) => Promise<void>
  onDeleteTopic: (topicId: string) => Promise<void>
  onCreateSubtopic: (payload: CreateSubtopicPayload) => Promise<SubTopicDetail>
  onDeleteSubtopic: (subtopicId: string) => Promise<void>
  onAttachTopicToSubject: (subjectId: string, topicId: string) => Promise<void>
  onDetachTopicFromSubject: (subjectId: string, topicId: string) => Promise<void>
}

const emptyCreateSubject: CreateSubjectPayload = {
  subject_name: "",
  subject_program: "",
}

const emptyCreateTopic: CreateTopicPayload = {
  topic_name: "",
}

export function SubjectsTopicsManagement({
  subjects,
  allSubjects = subjects,
  topics,
  allTopics = topics,
  loading,
  subjectsPage = 1,
  subjectsPageSize = subjects.length || 10,
  subjectsTotal = subjects.length,
  topicsPage = 1,
  topicsPageSize = topics.length || 10,
  topicsTotal = topics.length,
  onChangeSubjectsPage,
  onChangeTopicsPage,
  subjectsFilter = "",
  topicsFilter = "",
  onChangeSubjectsFilter,
  onChangeTopicsFilter,
  onCreateSubject,
  onUpdateSubject,
  onDeleteSubject,
  onCreateTopic,
  onUpdateTopic,
  onDeleteTopic,
  onCreateSubtopic,
  onDeleteSubtopic,
  onAttachTopicToSubject,
  onDetachTopicFromSubject,
}: SubjectsTopicsManagementProps) {
  const [subjectSearchQuery, setSubjectSearchQuery] = useState(subjectsFilter)
  const [topicSearchQuery, setTopicSearchQuery] = useState(topicsFilter)
  const [subtopicSearchQuery, setSubtopicSearchQuery] = useState("")
  const [subtopicSearchValue, setSubtopicSearchValue] = useState("")

  const [showNewSubjectDialog, setShowNewSubjectDialog] = useState(false)
  const [showEditSubjectDialog, setShowEditSubjectDialog] = useState(false)
  const [showDeleteSubjectDialog, setShowDeleteSubjectDialog] = useState(false)
  const [showNewTopicDialog, setShowNewTopicDialog] = useState(false)
  const [showEditTopicDialog, setShowEditTopicDialog] = useState(false)
  const [showDeleteTopicDialog, setShowDeleteTopicDialog] = useState(false)
  const [showAttachTopicDialog, setShowAttachTopicDialog] = useState(false)
  const [showDetachTopicDialog, setShowDetachTopicDialog] = useState(false)
  const [showAddSubtopicDialog, setShowAddSubtopicDialog] = useState(false)
  const [showDeleteSubtopicDialog, setShowDeleteSubtopicDialog] = useState(false)

  const [selectedSubject, setSelectedSubject] = useState<SubjectDetail | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<TopicDetail | null>(null)
  const [selectedSubtopic, setSelectedSubtopic] = useState<SubTopicDetail | null>(null)

  const [newSubjectForm, setNewSubjectForm] = useState<CreateSubjectPayload>(emptyCreateSubject)
  const [editSubjectForm, setEditSubjectForm] = useState<CreateSubjectPayload>(emptyCreateSubject)

  const [newTopicForm, setNewTopicForm] = useState<CreateTopicPayload>(emptyCreateTopic)
  const [editTopicForm, setEditTopicForm] = useState<CreateTopicPayload>(emptyCreateTopic)
  const [attachTopicId, setAttachTopicId] = useState<string | null>(null)

  const [newSubtopicName, setNewSubtopicName] = useState("")

  const [creatingSubject, setCreatingSubject] = useState(false)
  const [updatingSubject, setUpdatingSubject] = useState(false)
  const [deletingSubject, setDeletingSubject] = useState(false)

  const [creatingTopic, setCreatingTopic] = useState(false)
  const [updatingTopic, setUpdatingTopic] = useState(false)
  const [deletingTopic, setDeletingTopic] = useState(false)
  const [attachingTopic, setAttachingTopic] = useState(false)
  const [detachingTopic, setDetachingTopic] = useState(false)

  const [creatingSubtopic, setCreatingSubtopic] = useState(false)
  const [deletingSubtopic, setDeletingSubtopic] = useState(false)

  const availableTopicsForSelectedSubject = useMemo(
    () => {
      if (!selectedSubject) return []
      const existingIds = new Set(selectedSubject.topics.map((t) => t.topic_id))
      return allTopics.filter((topic) => !existingIds.has(topic.topic_id))
    },
    [selectedSubject, allTopics],
  )

  const isInitialLoading = loading && subjects.length === 0 && topics.length === 0

  const subjectsTotalPages =
    typeof subjectsTotal === "number" && subjectsPageSize > 0
      ? Math.max(1, Math.ceil(subjectsTotal / subjectsPageSize))
      : 1

  const topicsTotalPages =
    typeof topicsTotal === "number" && topicsPageSize > 0
      ? Math.max(1, Math.ceil(topicsTotal / topicsPageSize))
      : 1

  const handleCreateSubject = async () => {
    if (!newSubjectForm.subject_name.trim() || !newSubjectForm.subject_program.trim()) return
    try {
      setCreatingSubject(true)
      await onCreateSubject({
        subject_name: newSubjectForm.subject_name.trim(),
        subject_program: newSubjectForm.subject_program.trim(),
      })
      setShowNewSubjectDialog(false)
      setNewSubjectForm(emptyCreateSubject)
    } catch (error) {
      console.error("No se pudo crear la materia", error)
    } finally {
      setCreatingSubject(false)
    }
  }

  const handleUpdateSubject = async () => {
    if (!selectedSubject) return
    if (!editSubjectForm.subject_name.trim() || !editSubjectForm.subject_program.trim()) return

    try {
      setUpdatingSubject(true)
      await onUpdateSubject(selectedSubject.subject_id, {
        subject_name: editSubjectForm.subject_name.trim(),
        subject_program: editSubjectForm.subject_program.trim(),
      })
      setShowEditSubjectDialog(false)
      setSelectedSubject(null)
    } catch (error) {
      console.error("No se pudo actualizar la materia", error)
    } finally {
      setUpdatingSubject(false)
    }
  }

  const handleDeleteSubject = async () => {
    if (!selectedSubject) return
    try {
      setDeletingSubject(true)
      await onDeleteSubject(selectedSubject.subject_id)
      setShowDeleteSubjectDialog(false)
      setSelectedSubject(null)
    } catch (error) {
      console.error("No se pudo eliminar la materia", error)
    } finally {
      setDeletingSubject(false)
    }
  }

  const handleCreateTopic = async () => {
    if (!newTopicForm.topic_name.trim()) return
    try {
      setCreatingTopic(true)
      await onCreateTopic({
        topic_name: newTopicForm.topic_name.trim(),
      })
      setShowNewTopicDialog(false)
      setNewTopicForm(emptyCreateTopic)
    } catch (error) {
      console.error("No se pudo crear el tópico", error)
    } finally {
      setCreatingTopic(false)
    }
  }

  const handleUpdateTopic = async () => {
    if (!selectedTopic) return
    if (!editTopicForm.topic_name?.trim()) return

    try {
      setUpdatingTopic(true)
      await onUpdateTopic(selectedTopic.topic_id, {
        topic_name: editTopicForm.topic_name.trim(),
      })
      setShowEditTopicDialog(false)
      setSelectedTopic(null)
    } catch (error) {
      console.error("No se pudo actualizar el tópico", error)
    } finally {
      setUpdatingTopic(false)
    }
  }

  const handleDeleteTopic = async () => {
    if (!selectedTopic) return
    try {
      setDeletingTopic(true)
      await onDeleteTopic(selectedTopic.topic_id)
      setShowDeleteTopicDialog(false)
      setSelectedTopic(null)
    } catch (error) {
      console.error("No se pudo eliminar el tópico", error)
    } finally {
      setDeletingTopic(false)
    }
  }

  const handleCreateSubtopic = async () => {
    if (!selectedTopic || !newSubtopicName.trim()) return
    try {
      setCreatingSubtopic(true)
      await onCreateSubtopic({
        topic_associated_id: selectedTopic.topic_id,
        subtopic_name: newSubtopicName.trim(),
      })
      setShowAddSubtopicDialog(false)
      setSelectedTopic(null)
      setNewSubtopicName("")
    } catch (error) {
      console.error("No se pudo registrar el subtópico", error)
    } finally {
      setCreatingSubtopic(false)
    }
  }

  const handleDeleteSubtopic = async () => {
    if (!selectedSubtopic) return
    try {
      setDeletingSubtopic(true)
      await onDeleteSubtopic(selectedSubtopic.subtopic_id)
      setShowDeleteSubtopicDialog(false)
      setSelectedSubtopic(null)
    } catch (error) {
      console.error("No se pudo eliminar el subtópico", error)
    } finally {
      setDeletingSubtopic(false)
    }
  }

  const handleAttachTopic = async () => {
    if (!selectedSubject || !attachTopicId) return
    try {
      setAttachingTopic(true)
      await onAttachTopicToSubject(selectedSubject.subject_id, attachTopicId)
      setShowAttachTopicDialog(false)
      setSelectedSubject(null)
      setAttachTopicId(null)
    } catch (error) {
      console.error("No se pudo asociar el tópico a la materia", error)
    } finally {
      setAttachingTopic(false)
    }
  }

  const handleDetachTopic = async () => {
    if (!selectedSubject || !selectedTopic) return
    try {
      setDetachingTopic(true)
      await onDetachTopicFromSubject(selectedSubject.subject_id, selectedTopic.topic_id)
      setShowDetachTopicDialog(false)
      setSelectedSubject(null)
      setSelectedTopic(null)
    } catch (error) {
      console.error("No se pudo desasociar el tópico de la materia", error)
    } finally {
      setDetachingTopic(false)
    }
  }

  if (isInitialLoading) {
    return (
      <Card className="p-6 mt-6 flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando materias y tópicos...
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg">Materias</h2>
            <Button onClick={() => setShowNewSubjectDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Materia
            </Button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar materia por nombre..."
                className="pl-10"
                value={subjectSearchQuery}
                onChange={(e) => setSubjectSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onChangeSubjectsFilter?.(subjectSearchQuery.trim())
                  }
                }}
              />
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {subjects.map((subject) => (
              <AccordionItem key={subject.subject_id} value={subject.subject_id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{subject.subject_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {subject.subject_program}
                        {subject.subject_leader_name && (
                          <span className="text-xs"> • Jefe: {subject.subject_leader_name}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="ml-14 space-y-2 pt-2">
                    <div className="flex gap-2 mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedSubject(subject)
                          setAttachTopicId(null)
                          setShowAttachTopicDialog(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Tópico
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedSubject(subject)
                          setEditSubjectForm({
                            subject_name: subject.subject_name,
                            subject_program: subject.subject_program,
                          })
                          setShowEditSubjectDialog(true)
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar Materia
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedSubject(subject)
                          setShowDeleteSubjectDialog(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar Materia
                      </Button>
                    </div>
                    {subject.topics.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm mb-2">Tópicos asociados:</p>
                        {subject.topics.map((topic) => (
                          <div
                            key={topic.topic_id}
                            className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <FolderTree className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm">{topic.topic_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {topic.subtopics.length} subtópicos
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedSubject(subject)
                                  setSelectedTopic(topic)
                                  setShowDetachTopicDialog(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-2">
                        No hay tópicos asociados a esta materia
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {onChangeSubjectsPage && subjectsTotalPages > 1 && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {subjects.length} de {subjectsTotal ?? subjects.length} materias.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onChangeSubjectsPage(subjectsPage - 1)}
                  disabled={subjectsPage <= 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {subjectsPage} de {subjectsTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onChangeSubjectsPage(subjectsPage + 1)}
                  disabled={subjectsPage >= subjectsTotalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}

          {subjects.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No hay materias registradas</p>
              <Button onClick={() => setShowNewSubjectDialog(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Materia
              </Button>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg">Tópicos y Subtópicos</h2>
            <Button onClick={() => setShowNewTopicDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Tópico
            </Button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tópico por nombre..."
                className="pl-10"
                value={topicSearchQuery}
                onChange={(e) => setTopicSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onChangeTopicsFilter?.(topicSearchQuery.trim())
                  }
                }}
              />
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {topics.map((topic) => {
              const subjectCount = allSubjects.filter((s) =>
                s.topics.some((t) => t.topic_id === topic.topic_id),
              ).length
              const filteredSubtopics = topic.subtopics.filter((subtopic) =>
                subtopic.subtopic_name.toLowerCase().includes(subtopicSearchQuery.toLowerCase()),
              )
              return (
                <AccordionItem key={topic.topic_id} value={topic.topic_id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <FolderTree className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{topic.topic_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {subjectCount} materias asociadas • {topic.subtopics.length} subtópicos
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="ml-14 space-y-2 pt-2">
                      <div className="flex gap-2 mb-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTopic(topic)
                            setShowAddSubtopicDialog(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Subtópico
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTopic(topic)
                            setEditTopicForm({
                              topic_name: topic.topic_name,
                            })
                            setShowEditTopicDialog(true)
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editar Tópico
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTopic(topic)
                            setShowDeleteTopicDialog(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar Tópico
                        </Button>
                      </div>

                      {topic.subtopics.length > 0 && (
                        <div className="mb-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Buscar subtópico..."
                              className="pl-10"
                              value={subtopicSearchValue}
                              onChange={(e) => setSubtopicSearchValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  setSubtopicSearchQuery(subtopicSearchValue.trim())
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {filteredSubtopics.length > 0 ? (
                        <div className="space-y-2">
                          {filteredSubtopics.map((subtopic) => (
                            <div
                              key={subtopic.subtopic_id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <BookOpen className="h-4 w-4 text-blue-600" />
                                </div>
                                <p className="text-sm">{subtopic.subtopic_name}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedTopic(topic)
                                    setSelectedSubtopic(subtopic)
                                    setShowDeleteSubtopicDialog(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">No hay subtópicos en este tópico</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>

          {topics.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No hay tópicos creados</p>
              <Button onClick={() => setShowNewTopicDialog(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Tópico
              </Button>
            </div>
          )}
          {onChangeTopicsPage && topicsTotalPages > 1 && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {topics.length} de {topicsTotal ?? topics.length} tópicos.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onChangeTopicsPage(topicsPage - 1)}
                  disabled={topicsPage <= 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {topicsPage} de {topicsTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onChangeTopicsPage(topicsPage + 1)}
                  disabled={topicsPage >= topicsTotalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={showNewSubjectDialog} onOpenChange={setShowNewSubjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Materia</DialogTitle>
            <DialogDescription>Ingresa el nombre y el programa de la materia</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-subject-name">Nombre de la Materia</Label>
              <Input
                id="new-subject-name"
                value={newSubjectForm.subject_name}
                onChange={(e) => setNewSubjectForm({ ...newSubjectForm, subject_name: e.target.value })}
                placeholder="Ej: Ciencia de la Computación"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-subject-program">Programa</Label>
              <Input
                id="new-subject-program"
                value={newSubjectForm.subject_program}
                onChange={(e) => setNewSubjectForm({ ...newSubjectForm, subject_program: e.target.value })}
                placeholder="Ej: Licenciatura en Computación"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowNewSubjectDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSubject} disabled={creatingSubject}>
              {creatingSubject ? "Creando..." : "Crear Materia"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditSubjectDialog} onOpenChange={setShowEditSubjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Materia</DialogTitle>
            <DialogDescription>Actualiza la información principal de la materia</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-subject-name">Nombre de la Materia</Label>
              <Input
                id="edit-subject-name"
                value={editSubjectForm.subject_name}
                onChange={(e) => setEditSubjectForm({ ...editSubjectForm, subject_name: e.target.value })}
                placeholder="Ej: Ciencia de la Computación"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-subject-program">Programa</Label>
              <Input
                id="edit-subject-program"
                value={editSubjectForm.subject_program}
                onChange={(e) => setEditSubjectForm({ ...editSubjectForm, subject_program: e.target.value })}
                placeholder="Ej: Licenciatura en Computación"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowEditSubjectDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateSubject} disabled={updatingSubject}>
              {updatingSubject ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteSubjectDialog} onOpenChange={setShowDeleteSubjectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar materia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la materia {selectedSubject?.subject_name} y sus
              tópicos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubject} disabled={deletingSubject}>
              {deletingSubject ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showAttachTopicDialog} onOpenChange={setShowAttachTopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar tópico a materia</DialogTitle>
            <DialogDescription>
              Selecciona un tópico existente para asociarlo a la materia seleccionada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Materia</Label>
              <Input value={selectedSubject?.subject_name ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Tópico</Label>
              <Select
                value={attachTopicId ?? ""}
                onValueChange={(value) => setAttachTopicId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un tópico" />
                </SelectTrigger>
                <SelectContent>
                  {availableTopicsForSelectedSubject.map((topic) => (
                    <SelectItem key={topic.topic_id} value={topic.topic_id}>
                      {topic.topic_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAttachTopicDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAttachTopic}
              disabled={attachingTopic || !attachTopicId || availableTopicsForSelectedSubject.length === 0}
            >
              {attachingTopic ? "Agregando..." : "Agregar Tópico"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewTopicDialog} onOpenChange={setShowNewTopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Tópico</DialogTitle>
            <DialogDescription>Define el nombre del nuevo tópico</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-topic-name">Nombre del Tópico</Label>
              <Input
                id="new-topic-name"
                value={newTopicForm.topic_name}
                onChange={(e) => setNewTopicForm({ ...newTopicForm, topic_name: e.target.value })}
                placeholder="Ej: Algoritmos"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowNewTopicDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTopic} disabled={creatingTopic}>
              {creatingTopic ? "Creando..." : "Crear Tópico"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditTopicDialog} onOpenChange={setShowEditTopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tópico</DialogTitle>
            <DialogDescription>Actualiza el nombre del tópico</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-topic-name">Nombre del Tópico</Label>
              <Input
                id="edit-topic-name"
                value={editTopicForm.topic_name ?? ""}
                onChange={(e) => setEditTopicForm({ ...editTopicForm, topic_name: e.target.value })}
                placeholder="Ej: Algoritmos"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowEditTopicDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateTopic} disabled={updatingTopic}>
              {updatingTopic ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteTopicDialog} onOpenChange={setShowDeleteTopicDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tópico?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el tópico {selectedTopic?.topic_name} y todos sus subtópicos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTopic} disabled={deletingTopic}>
              {deletingTopic ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showAddSubtopicDialog} onOpenChange={setShowAddSubtopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Subtópico</DialogTitle>
            <DialogDescription>Completa el nombre del nuevo subtópico</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-subtopic-name">Nombre del Subtópico</Label>
              <Input
                id="new-subtopic-name"
                value={newSubtopicName}
                onChange={(e) => setNewSubtopicName(e.target.value)}
                placeholder="Ej: Ordenamiento"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddSubtopicDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSubtopic} disabled={creatingSubtopic}>
              {creatingSubtopic ? "Agregando..." : "Agregar Subtópico"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteSubtopicDialog} onOpenChange={setShowDeleteSubtopicDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar subtópico?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el subtópico {selectedSubtopic?.subtopic_name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubtopic} disabled={deletingSubtopic}>
              {deletingSubtopic ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDetachTopicDialog} onOpenChange={setShowDetachTopicDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar tópico de la materia?</AlertDialogTitle>
            <AlertDialogDescription>
              Se quitará el tópico {selectedTopic?.topic_name} de la materia {selectedSubject?.subject_name}, pero el
              tópico seguirá existiendo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDetachTopic} disabled={detachingTopic}>
              {detachingTopic ? "Quitando..." : "Quitar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
