import { Card } from "../../../ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../ui/alert-dialog"
import { Settings, Trash2 } from "lucide-react"
import { useState } from "react"
import type { QuestionType } from "./question-type-form"

interface QuestionTypeListProps {
  questionTypes: QuestionType[]
  onDeleteType: (typeId: string) => void
}

export function QuestionTypeList({ questionTypes, onDeleteType }: QuestionTypeListProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedType, setSelectedType] = useState<QuestionType | null>(null)

  const handleDeleteType = () => {
    if (selectedType) {
      onDeleteType(selectedType.id)
      setShowDeleteDialog(false)
      setSelectedType(null)
    }
  }

  return (
    <>
      <Card className="p-6">
        <h2 className="text-lg mb-4">Tipos de Preguntas</h2>
        <div className="space-y-2">
          {questionTypes.map((type) => (
            <div
              key={type.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
              onClick={() => {
                setSelectedType(type)
                setShowDeleteDialog(true)
              }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{type.name}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Dialog de Eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esta acción eliminará permanentemente el tipo de pregunta {selectedType?.name} del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteType}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
