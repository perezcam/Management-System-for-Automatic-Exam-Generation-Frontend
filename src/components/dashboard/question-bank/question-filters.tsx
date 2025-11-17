import { Search, Filter, X } from "lucide-react"
import { Input } from "../../ui/input"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Card } from "../../ui/card"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"

export type Filters = {
  subtopic: string
  type: string
  difficulty: string
}

interface QuestionFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  showFilters: boolean
  onToggleFilters: () => void
  uniqueSubtopics: string[]
  uniqueTypes: string[]
}

export function QuestionFilters({
  filters,
  onFiltersChange,
  showFilters,
  onToggleFilters,
  uniqueSubtopics,
  uniqueTypes
}: QuestionFiltersProps) {
  const clearFilters = () => {
    onFiltersChange({ subtopic: "all", type: "all", difficulty: "all" })
  }

  const hasActiveFilters = (filters.subtopic && filters.subtopic !== "all") || 
                           (filters.type && filters.type !== "all") || 
                           (filters.difficulty && filters.difficulty !== "all")

  const activeFiltersCount = [
    filters.subtopic !== "all" ? 1 : 0,
    filters.type !== "all" ? 1 : 0,
    filters.difficulty !== "all" ? 1 : 0
  ].reduce((a, b) => a + b, 0)

  return (
    <>
      <div className="mb-6 flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar preguntas..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={onToggleFilters}>
          <Filter className="mr-2 h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <Badge className="ml-2 bg-blue-500 hover:bg-blue-500">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Limpiar Filtros
          </Button>
        )}
      </div>

      {showFilters && (
        <Card className="mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subtopic-filter">Subtópico</Label>
              <Select
                value={filters.subtopic}
                onValueChange={(value) => onFiltersChange({ ...filters, subtopic: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueSubtopics.map((subtopic) => (
                    <SelectItem key={subtopic} value={subtopic}>
                      {subtopic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-filter">Tipo de Pregunta</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => onFiltersChange({ ...filters, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Fácil">Fácil</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Difícil">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
