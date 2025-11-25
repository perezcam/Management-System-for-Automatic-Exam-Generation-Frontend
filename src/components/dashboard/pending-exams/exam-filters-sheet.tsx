import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"

export interface ExamFilters {
  profesor: string
  asignatura: string
  estado: string
  nombreExamen: string
}

interface ExamFiltersSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: ExamFilters
  onFiltersChange: (filters: ExamFilters) => void
  profesores: string[]
  asignaturas: string[]
  onApplyFilters?: () => void
}

export function ExamFiltersSheet({ 
  open,
  onOpenChange,
  filters, 
  onFiltersChange, 
  profesores, 
  asignaturas,
  onApplyFilters
}: ExamFiltersSheetProps) {
  const handleFilterChange = (key: keyof ExamFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      profesor: "todos",
      asignatura: "todas",
      estado: "todos",
      nombreExamen: "todos"
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
            <Label htmlFor="profesor-filter">Profesor</Label>
            <Select 
              value={filters.profesor} 
              onValueChange={(value) => handleFilterChange("profesor", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {profesores.map((profesor) => (
                  <SelectItem key={profesor} value={profesor}>
                    {profesor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asignatura-filter">Asignatura</Label>
            <Select 
              value={filters.asignatura} 
              onValueChange={(value) => handleFilterChange("asignatura", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {asignaturas.map((asignatura) => (
                  <SelectItem key={asignatura} value={asignatura}>
                    {asignatura}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado-filter">Estado</Label>
            <Select 
              value={filters.estado} 
              onValueChange={(value) => handleFilterChange("estado", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
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