import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"

export type RevisionFilters = {
  studentId: string
  subjectId: string
}

export type RevisionFilterOption = { value: string; label: string }

interface RevisionFiltersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: RevisionFilters
  onFiltersChange: (filters: RevisionFilters) => void
  studentOptions: RevisionFilterOption[]
  subjectOptions: RevisionFilterOption[]
  onApplyFilters?: () => void
}

export function RevisionFiltersDialog({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  studentOptions,
  subjectOptions,
  onApplyFilters
}: RevisionFiltersDialogProps) {
  const handleFilterChange = (key: keyof RevisionFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      studentId: "ALL",
      subjectId: "ALL"
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filtros de Calificaciones</DialogTitle>
          <DialogDescription>
            Filtra las calificaciones por diferentes criterios
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
                {subjectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alumno-filter">Alumno</Label>
            <Select
              value={filters.studentId}
              onValueChange={(value) => handleFilterChange("studentId", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {studentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
