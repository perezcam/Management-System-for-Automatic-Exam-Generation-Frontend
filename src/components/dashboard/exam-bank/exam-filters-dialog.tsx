import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Button } from "../../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"

export interface ExamFilters {
  author: string
  subject: string
  difficulty: string
  status: string
}

interface ExamFiltersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: ExamFilters
  onFiltersChange: (filters: ExamFilters) => void
  availableAuthors: string[]
  availableSubjects: string[]
  onApplyFilters?: () => void
}

export function ExamFiltersDialog({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  availableAuthors,
  availableSubjects,
  onApplyFilters
}: ExamFiltersDialogProps) {
  const handleReset = () => {
    onFiltersChange({
      author: "all",
      subject: "all",
      difficulty: "all",
      status: "all"
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
            <Label htmlFor="author-filter">Autor</Label>
            <Select
              value={filters.author}
              onValueChange={(value) => onFiltersChange({ ...filters, author: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {availableAuthors.map((author) => (
                  <SelectItem key={author} value={author}>
                    {author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-filter">Asignatura</Label>
            <Select
              value={filters.subject}
              onValueChange={(value) => onFiltersChange({ ...filters, subject: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {availableSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
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
                <SelectItem value="Fácil">Fácil</SelectItem>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="Difícil">Difícil</SelectItem>
                <SelectItem value="Mixta">Mixta</SelectItem>
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
                <SelectItem value="Bajo Revisión">Bajo Revisión</SelectItem>
                <SelectItem value="Aprobado">Aprobado</SelectItem>
                <SelectItem value="Rechazado">Rechazado</SelectItem>
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