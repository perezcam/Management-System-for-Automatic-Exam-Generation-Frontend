'use client';

import { Card } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../ui/alert-dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import { Plus, Trash2, GraduationCap, FolderTree, BookOpen } from "lucide-react"
import { useState } from "react"

export type Subject = {
  id: string
  name: string
  programa: string
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
  onCreateSubject: (subject: Subject) => void
  onDeleteSubject: (subjectId: string) => void
  onCreateTopic: (topic: Topic) => void
  onDeleteTopic: (topicId: string) => void
  onAddSubtopic: (topicId: string, subtopic: string) => void
  onDeleteSubtopic: (topicId: string, subtopic: string) => void
}

export function SubjectsTopicsManagement({
  subjects,
  topics,
  onCreateSubject,
  onDeleteSubject,
  onCreateTopic,
  onDeleteTopic,
  onAddSubtopic,
  onDeleteSubtopic
}: SubjectsTopicsManagementProps) {
  // Estados para diálogos de materias
  const [showNewSubjectDialog, setShowNewSubjectDialog] = useState(false)
  const [showDeleteSubjectDialog, setShowDeleteSubjectDialog] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [newSubjectForm, setNewSubjectForm] = useState({ name: "", programa: "" })

  // Estados para diálogos de tópicos
  const [showNewTopicDialog, setShowNewTopicDialog] = useState(false)
  const [showDeleteTopicDialog, setShowDeleteTopicDialog] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [newTopicForm, setNewTopicForm] = useState({ name: "", subjectId: "" })

  // Estados para diálogos de subtópicos
  const [showAddSubtopicDialog, setShowAddSubtopicDialog] = useState(false)
  const [showDeleteSubtopicDialog, setShowDeleteSubtopicDialog] = useState(false)
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>("")
  const [newSubtopicName, setNewSubtopicName] = useState("")

  const handleCreateSubject = () => {
    if (newSubjectForm.name.trim() && newSubjectForm.programa.trim()) {
      onCreateSubject({ id: String(Date.now()), name: newSubjectForm.name, programa: newSubjectForm.programa })
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
          
          <Accordion type="single" collapsible className="w-full">
            {subjects.map((subject) => {
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
                        <p className="text-sm text-muted-foreground">{subject.programa} • {relatedTopics.length} tópicos</p>
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
          
          <Accordion type="single" collapsible className="w-full">
            {topics.map((topic) => {
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
                            setShowDeleteTopicDialog(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar Tópico
                        </Button>
                      </div>
                      {topic.subtopics.length > 0 ? (
                        <div className="space-y-2">
                          {topic.subtopics.map((subtopic) => (
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
              <Select value={newTopicForm.subjectId} onValueChange={(value:string) => setNewTopicForm({ ...newTopicForm, subjectId: value })}>
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
    </>
  )
}
