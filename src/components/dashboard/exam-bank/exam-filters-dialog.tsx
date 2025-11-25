import type { ExamFilters } from "@/hooks/exams/use-exams"
import { DEFAULT_EXAM_FILTERS } from "@/hooks/exams/use-exams"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Button } from "../../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"

export type AvailableSubjectOption = { id: string; name: string }
export type AvailableAuthorOption = { id: string; name: string }
export type SelectOption = { value: string; label: string }

interface ExamFiltersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: ExamFilters
  onFiltersChange: (filters: ExamFilters) => void
  availableAuthors: AvailableAuthorOption[]
  availableSubjects: AvailableSubjectOption[]
  availableStatuses: SelectOption[]
  availableDifficulties: SelectOption[]
  onApplyFilters?: () => void
}

export function ExamFiltersDialog({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  availableAuthors,
  availableSubjects,
  availableStatuses,
  availableDifficulties,
  onApplyFilters
}: ExamFiltersDialogProps) {
  const handleReset = () => {
    onFiltersChange({ ...DEFAULT_EXAM_FILTERS })
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
            <Label htmlFor="author-filter">Autor</Label>
            <Select
              value={filters.authorId}
              onValueChange={(value) => onFiltersChange({ ...filters, authorId: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {availableAuthors.map((author) => (
                  <SelectItem key={author.id} value={author.id}>
                    {author.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-filter">Asignatura</Label>
            <Select
              value={filters.subjectId}
              onValueChange={(value) => onFiltersChange({ ...filters, subjectId: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {availableSubjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty-filter">Dificultad</Label>
            <Select
              value={filters.difficulty}
              onValueChange={(value) => onFiltersChange({ ...filters, difficulty: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {availableDifficulties.map((difficulty) => (
                  <SelectItem key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-filter">Estado</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {availableStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-between gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            Limpiar Filtros
          </Button>
          <Button onClick={() => {
            if (onApplyFilters) {
              onApplyFilters();
            }
            onOpenChange(false);
          }}>
            Aplicar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
