import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { StudentExamFilters } from "@/types/exam-application/filters"
import { AssignedExamStatus } from "@/types/exam-application/exam"

interface StudentExamFiltersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: StudentExamFilters
  onFiltersChange: (filters: StudentExamFilters) => void
  asignaturas: { id: string; name: string }[]
  profesores: { id: string; name: string }[]
  onApplyFilters?: () => void
}

export function StudentExamFiltersDialog({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  asignaturas,
  profesores,
  onApplyFilters
}: StudentExamFiltersDialogProps) {
  const handleFilterChange = (key: keyof StudentExamFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      status: "ALL",
      subjectId: "ALL",
      teacherId: "ALL"
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filtros de Exámenes</DialogTitle>
          <DialogDescription>
            Filtra los exámenes por diferentes criterios
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="estado-filter">Estado</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value={AssignedExamStatus.PENDING}>Pendiente</SelectItem>
                <SelectItem value={AssignedExamStatus.ENABLED}>Activo</SelectItem>
                <SelectItem value={AssignedExamStatus.IN_EVALUATION}>En evaluación</SelectItem>
                <SelectItem value={AssignedExamStatus.REGRADING}>En recalificación</SelectItem>
                <SelectItem value={AssignedExamStatus.REGRADED}>Recalificado</SelectItem>
                <SelectItem value={AssignedExamStatus.GRADED}>Calificado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asignatura-filter">Asignatura</Label>
            <Select
              value={filters.subjectId}
              onValueChange={(value) => handleFilterChange("subjectId", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {asignaturas.map((asignatura) => (
                  <SelectItem key={asignatura.id} value={asignatura.id}>
                    {asignatura.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profesor-filter">Profesor</Label>
            <Select
              value={filters.teacherId}
              onValueChange={(value) => handleFilterChange("teacherId", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {profesores.map((profesor) => (
                  <SelectItem key={profesor.id} value={profesor.id}>
                    {profesor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-between gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClearFilters}>
            Limpiar Filtros
          </Button>
          <Button onClick={() => {
            if (onApplyFilters) {
              onApplyFilters()
            } else {
              onOpenChange(false)
            }
          }}>
            Aplicar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
