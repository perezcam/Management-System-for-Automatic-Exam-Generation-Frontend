import { Card } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../ui/alert-dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import { Plus, Trash2, GraduationCap, FolderTree, BookOpen, Search, Edit2 } from "lucide-react"
import { useState } from "react"

export type Subject = {
  id: string
  name: string
  programa: string
  profesorJefe?: string
}

export type Topic = {
  id: string
  name: string
  subjectId: string
  subtopics: string[]
}

interface SubjectsTopicsManagementProps {
  subjects: Subject[]
  topics: Topic[]
  profesores: { id: string; nombre: string }[]
  onCreateSubject: (subject: Subject) => void
  onUpdateSubject: (subjectId: string, updates: Partial<Subject>) => void
  onDeleteSubject: (subjectId: string) => void
  onCreateTopic: (topic: Topic) => void
  onUpdateTopic: (topicId: string, updates: Partial<Topic>) => void
  onDeleteTopic: (topicId: string) => void
  onAddSubtopic: (topicId: string, subtopic: string) => void
  onUpdateSubtopic: (topicId: string, oldSubtopic: string, newSubtopic: string) => void
  onDeleteSubtopic: (topicId: string, subtopic: string) => void
}

export function SubjectsTopicsManagement({
  subjects,
  topics,
  profesores,
  onCreateSubject,
  onUpdateSubject,
  onDeleteSubject,
  onCreateTopic,
  onUpdateTopic,
  onDeleteTopic,
  onAddSubtopic,
  onUpdateSubtopic,
  onDeleteSubtopic
}: SubjectsTopicsManagementProps) {
  // Estados para búsqueda
  const [subjectSearchQuery, setSubjectSearchQuery] = useState("")
  const [topicSearchQuery, setTopicSearchQuery] = useState("")
  const [subtopicSearchQuery, setSubtopicSearchQuery] = useState("")

  // Estados para diálogos de materias
  const [showNewSubjectDialog, setShowNewSubjectDialog] = useState(false)
  const [showEditSubjectDialog, setShowEditSubjectDialog] = useState(false)
  const [showDeleteSubjectDialog, setShowDeleteSubjectDialog] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [newSubjectForm, setNewSubjectForm] = useState({ name: "", programa: "" })
  const [editSubjectForm, setEditSubjectForm] = useState({ name: "", programa: "", profesorJefe: "" })

  // Estados para diálogos de tópicos
  const [showNewTopicDialog, setShowNewTopicDialog] = useState(false)
  const [showEditTopicDialog, setShowEditTopicDialog] = useState(false)
  const [showDeleteTopicDialog, setShowDeleteTopicDialog] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [newTopicForm, setNewTopicForm] = useState({ name: "", subjectId: "" })
  const [editTopicForm, setEditTopicForm] = useState({ name: "" })

  // Estados para diálogos de subtópicos
  const [showAddSubtopicDialog, setShowAddSubtopicDialog] = useState(false)
  const [showEditSubtopicDialog, setShowEditSubtopicDialog] = useState(false)
  const [showDeleteSubtopicDialog, setShowDeleteSubtopicDialog] = useState(false)
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>("")
  const [newSubtopicName, setNewSubtopicName] = useState("")
  const [editSubtopicName, setEditSubtopicName] = useState("")

  const handleCreateSubject = () => {
    if (newSubjectForm.name.trim() && newSubjectForm.programa.trim()) {
      onCreateSubject({ 
        id: String(Date.now()), 
        name: newSubjectForm.name, 
        programa: newSubjectForm.programa
      })
      setNewSubjectForm({ name: "", programa: "" })
      setShowNewSubjectDialog(false)
    }
  }

  const handleDeleteSubject = () => {
    if (selectedSubject) {
      onDeleteSubject(selectedSubject.id)
      setShowDeleteSubjectDialog(false)
      setSelectedSubject(null)
    }
  }

  const handleCreateTopic = () => {
    if (newTopicForm.name.trim() && newTopicForm.subjectId.trim()) {
      onCreateTopic({ id: String(Date.now()), name: newTopicForm.name, subjectId: newTopicForm.subjectId, subtopics: [] })
      setNewTopicForm({ name: "", subjectId: "" })
      setShowNewTopicDialog(false)
    }
  }

  const handleDeleteTopic = () => {
    if (selectedTopic) {
      onDeleteTopic(selectedTopic.id)
      setShowDeleteTopicDialog(false)
      setSelectedTopic(null)
    }
  }

  const handleAddSubtopic = () => {
    if (selectedTopic && newSubtopicName.trim()) {
      onAddSubtopic(selectedTopic.id, newSubtopicName)
      setNewSubtopicName("")
      setShowAddSubtopicDialog(false)
      setSelectedTopic(null)
    }
  }

  const handleDeleteSubtopic = () => {
    if (selectedTopic && selectedSubtopic) {
      onDeleteSubtopic(selectedTopic.id, selectedSubtopic)
      setShowDeleteSubtopicDialog(false)
      setSelectedTopic(null)
      setSelectedSubtopic("")
    }
  }

  const handleEditSubject = () => {
    if (selectedSubject && editSubjectForm.name.trim() && editSubjectForm.programa.trim()) {
      onUpdateSubject(selectedSubject.id, {
        name: editSubjectForm.name,
        programa: editSubjectForm.programa,
        profesorJefe: editSubjectForm.profesorJefe || undefined
      })
      setShowEditSubjectDialog(false)
      setSelectedSubject(null)
    }
  }

  const handleEditTopic = () => {
    if (selectedTopic && editTopicForm.name.trim()) {
      onUpdateTopic(selectedTopic.id, { name: editTopicForm.name })
      setShowEditTopicDialog(false)
      setSelectedTopic(null)
    }
  }

  const handleEditSubtopic = () => {
    if (selectedTopic && selectedSubtopic && editSubtopicName.trim()) {
      onUpdateSubtopic(selectedTopic.id, selectedSubtopic, editSubtopicName)
      setShowEditSubtopicDialog(false)
      setSelectedTopic(null)
      setSelectedSubtopic("")
      setEditSubtopicName("")
    }
  }

  return (
    <>
      {/* Gestión de Materias */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg">Materias</h2>
            <Button onClick={() => setShowNewSubjectDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Materia
            </Button>
          </div>

          {/* Buscador de Materias */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar materia por nombre..."
                className="pl-10"
                value={subjectSearchQuery}
                onChange={(e) => setSubjectSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {subjects
              .filter(subject => subject.name.toLowerCase().includes(subjectSearchQuery.toLowerCase()))
              .map((subject) => {
              const relatedTopics = topics.filter(t => t.subjectId === subject.id)
              return (
                <AccordionItem key={subject.id} value={subject.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{subject.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {relatedTopics.length} tópicos
                          {subject.profesorJefe && (
                            <span className="text-xs"> • Profesor: {subject.profesorJefe}</span>
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
                            setEditSubjectForm({ 
                              name: subject.name, 
                              programa: subject.programa,
                              profesorJefe: subject.profesorJefe || ""
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
                      {relatedTopics.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-sm mb-2">Tópicos asociados:</p>
                          {relatedTopics.map((topic) => (
                            <div
                              key={topic.id}
                              className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                  <FolderTree className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-sm">{topic.name}</p>
                                  <p className="text-xs text-muted-foreground">{topic.subtopics.length} subtópicos</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">No hay tópicos asociados a esta materia</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
          
          {subjects.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No hay materias creadas</p>
              <Button onClick={() => setShowNewSubjectDialog(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Materia
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Gestión de Tópicos y Subtópicos */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg">Tópicos y Subtópicos</h2>
            <Button onClick={() => setShowNewTopicDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Tópico
            </Button>
          </div>

          {/* Buscador de Tópicos */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tópico por nombre..."
                className="pl-10"
                value={topicSearchQuery}
                onChange={(e) => setTopicSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {topics
              .filter(topic => topic.name.toLowerCase().includes(topicSearchQuery.toLowerCase()))
              .map((topic) => {
              const subject = subjects.find(s => s.id === topic.subjectId)
              return (
                <AccordionItem key={topic.id} value={topic.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <FolderTree className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{topic.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {subject?.name || 'Sin materia'} • {topic.subtopics.length} subtópicos
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
                            setEditTopicForm({ name: topic.name })
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

                      {/* Buscador de Subtópicos */}
                      {topic.subtopics.length > 0 && (
                        <div className="mb-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Buscar subtópico..."
                              className="pl-10"
                              value={subtopicSearchQuery}
                              onChange={(e) => setSubtopicSearchQuery(e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {topic.subtopics.length > 0 ? (
                        <div className="space-y-2">
                          {topic.subtopics
                            .filter(subtopic => subtopic.toLowerCase().includes(subtopicSearchQuery.toLowerCase()))
                            .map((subtopic) => (
                            <div
                              key={subtopic}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <BookOpen className="h-4 w-4 text-blue-600" />
                                </div>
                                <p className="text-sm">{subtopic}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedTopic(topic)
                                    setSelectedSubtopic(subtopic)
                                    setEditSubtopicName(subtopic)
                                    setShowEditSubtopicDialog(true)
                                  }}
                                >
                                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
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
        </Card>
      </div>

      {/* DIÁLOGOS */}

      {/* Dialog Nueva Materia */}
      <Dialog open={showNewSubjectDialog} onOpenChange={setShowNewSubjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Materia</DialogTitle>
            <DialogDescription>
              Ingresa el nombre y programa de la nueva materia
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-subject-name">Nombre de la Materia</Label>
              <Input
                id="new-subject-name"
                value={newSubjectForm.name}
                onChange={(e) => setNewSubjectForm({ ...newSubjectForm, name: e.target.value })}
                placeholder="Ej: Ciencia de la Computación"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-subject-programa">Programa</Label>
              <Input
                id="new-subject-programa"
                value={newSubjectForm.programa}
                onChange={(e) => setNewSubjectForm({ ...newSubjectForm, programa: e.target.value })}
                placeholder="Ej: Licenciatura en Computación"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowNewSubjectDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSubject}>
              Crear Materia
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Eliminación de Materia */}
      <AlertDialog open={showDeleteSubjectDialog} onOpenChange={setShowDeleteSubjectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esta acción eliminará permanentemente la materia {selectedSubject?.name} del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteSubjectDialog(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubject}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Nuevo Tópico */}
      <Dialog open={showNewTopicDialog} onOpenChange={setShowNewTopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Tópico</DialogTitle>
            <DialogDescription>
              Ingresa el nombre del nuevo tópico
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-topic-name">Nombre del Tópico</Label>
              <Input
                id="new-topic-name"
                value={newTopicForm.name}
                onChange={(e) => setNewTopicForm({ ...newTopicForm, name: e.target.value })}
                placeholder="Ej: Algoritmos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-topic-subject">Materia</Label>
              <Select value={newTopicForm.subjectId} onValueChange={(value) => setNewTopicForm({ ...newTopicForm, subjectId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una materia" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowNewTopicDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTopic}>
              Crear Tópico
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Eliminación de Tópico */}
      <AlertDialog open={showDeleteTopicDialog} onOpenChange={setShowDeleteTopicDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esta acción eliminará permanentemente el tópico {selectedTopic?.name} y todos sus subtópicos del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteTopicDialog(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTopic}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Agregar Subtópico */}
      <Dialog open={showAddSubtopicDialog} onOpenChange={setShowAddSubtopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Subtópico</DialogTitle>
            <DialogDescription>
              Ingresa el nombre del nuevo subtópico para {selectedTopic?.name}
            </DialogDescription>
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
            <Button onClick={handleAddSubtopic}>
              Agregar Subtópico
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Eliminación de Subtópico */}
      <AlertDialog open={showDeleteSubtopicDialog} onOpenChange={setShowDeleteSubtopicDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esta acción eliminará permanentemente el subtópico {selectedSubtopic} del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteSubtopicDialog(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubtopic}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Editar Materia */}
      <Dialog open={showEditSubjectDialog} onOpenChange={setShowEditSubjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Materia</DialogTitle>
            <DialogDescription>
              Modifica la información de la materia
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-subject-name">Nombre de la Materia</Label>
              <Input
                id="edit-subject-name"
                value={editSubjectForm.name}
                onChange={(e) => setEditSubjectForm({ ...editSubjectForm, name: e.target.value })}
                placeholder="Ej: Ciencia de la Computación"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-subject-programa">Programa</Label>
              <Input
                id="edit-subject-programa"
                value={editSubjectForm.programa}
                onChange={(e) => setEditSubjectForm({ ...editSubjectForm, programa: e.target.value })}
                placeholder="Ej: Licenciatura en Computación"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-subject-profesor">Profesor Jefe (Opcional)</Label>
              <Select value={editSubjectForm.profesorJefe} onValueChange={(value) => setEditSubjectForm({ ...editSubjectForm, profesorJefe: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un profesor" />
                </SelectTrigger>
                <SelectContent>
                  {profesores.map(profesor => (
                    <SelectItem key={profesor.id} value={profesor.nombre}>{profesor.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowEditSubjectDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubject}>
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Tópico */}
      <Dialog open={showEditTopicDialog} onOpenChange={setShowEditTopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tópico</DialogTitle>
            <DialogDescription>
              Modifica el nombre del tópico
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-topic-name">Nombre del Tópico</Label>
              <Input
                id="edit-topic-name"
                value={editTopicForm.name}
                onChange={(e) => setEditTopicForm({ ...editTopicForm, name: e.target.value })}
                placeholder="Ej: Algoritmos"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowEditTopicDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditTopic}>
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Subtópico */}
      <Dialog open={showEditSubtopicDialog} onOpenChange={setShowEditSubtopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Subtópico</DialogTitle>
            <DialogDescription>
              Modifica el nombre del subtópico
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-subtopic-name">Nombre del Subtópico</Label>
              <Input
                id="edit-subtopic-name"
                value={editSubtopicName}
                onChange={(e) => setEditSubtopicName(e.target.value)}
                placeholder="Ej: Ordenamiento"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowEditSubtopicDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubtopic}>
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}