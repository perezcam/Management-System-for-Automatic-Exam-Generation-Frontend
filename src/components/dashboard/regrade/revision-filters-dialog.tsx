import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"

interface RevisionFilters {
  alumno: string
  asignatura: string
  estado: string
  nombrePrueba: string
}

interface RevisionFiltersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: RevisionFilters
  onFiltersChange: (filters: RevisionFilters) => void
  alumnos: string[]
  asignaturas: string[]
  nombresPruebas: string[]
  onApplyFilters?: () => void
}

export function RevisionFiltersDialog({ 
  open,
  onOpenChange,
  filters, 
  onFiltersChange, 
  alumnos,
  asignaturas,
  nombresPruebas,
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
      alumno: "todos",
      asignatura: "todas",
      estado: "todos",
      nombrePrueba: "todos"
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filtros de Revisiones</DialogTitle>
          <DialogDescription>
            Filtra las revisiones por diferentes criterios
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
                <SelectItem value="revisado">Revisado</SelectItem>
                <SelectItem value="reclamado">Reclamado</SelectItem>
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
            <Label htmlFor="alumno-filter">Alumno</Label>
            <Select 
              value={filters.alumno} 
              onValueChange={(value) => handleFilterChange("alumno", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {alumnos.map((alumno) => (
                  <SelectItem key={alumno} value={alumno}>
                    {alumno}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombrePrueba-filter">Nombre de Prueba</Label>
            <Select 
              value={filters.nombrePrueba} 
              onValueChange={(value) => handleFilterChange("nombrePrueba", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {nombresPruebas.map((prueba) => (
                  <SelectItem key={prueba} value={prueba}>
                    {prueba}
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
