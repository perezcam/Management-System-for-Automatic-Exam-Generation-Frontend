import type { PendingExamFilterOption, PendingExamFilters } from "@/types/pending-exams/exam";
import { ALL_PENDING_EXAMS_FILTER } from "@/hooks/exams/use-pending-exams";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

type ExamFiltersSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: PendingExamFilters;
  onFiltersChange: (filters: PendingExamFilters) => void;
  professors: PendingExamFilterOption[];
  onApplyFilters?: () => void;
};

const getDefaultFilters = (): PendingExamFilters => ({
  professorId: ALL_PENDING_EXAMS_FILTER,
});

export function ExamFiltersSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  professors,
  onApplyFilters,
}: ExamFiltersSheetProps) {
  const handleFilterChange = (key: keyof PendingExamFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange(getDefaultFilters());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filtros de Exámenes</DialogTitle>
          <DialogDescription>Filtra los exámenes por diferentes criterios</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="professor-filter">Profesor</Label>
            <Select value={filters.professorId} onValueChange={(value) => handleFilterChange("professorId", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_PENDING_EXAMS_FILTER}>Todos</SelectItem>
                {professors.map((professor) => (
                  <SelectItem key={professor.value} value={professor.value}>
                    {professor.label}
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
          <Button
            onClick={() => {
              if (onApplyFilters) {
                onApplyFilters();
              } else {
                onOpenChange(false);
              }
            }}
          >
            Aplicar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
