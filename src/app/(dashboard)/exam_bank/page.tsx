"use client"

import { useEffect, useMemo, useState } from "react"
import { Filter, Search } from "lucide-react"

import { ExamBankHeader } from "@/components/dashboard/exam-bank/exam-bank-header"
import { ExamFiltersDialog, type SelectOption } from "@/components/dashboard/exam-bank/exam-filters-dialog"
import { ExamList } from "@/components/dashboard/exam-bank/exam-list"
import { EmptyState } from "@/components/dashboard/exam-bank/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DIFFICULTY_LABELS, STATUS_LABELS, useExams } from "@/hooks/exams/use-exams"

export default function BancoExamenesView() {
  const {
    exams,
    filters,
    setFilters,
    search,
    setSearch,
    loading,
    error,
    total,
    page,
    pageSize,
    setPage,
    availableSubjects,
    availableAuthors,
    availableStatuses,
    availableDifficulties,
  } = useExams()

  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [tempFilters, setTempFilters] = useState(filters)

  useEffect(() => {
    if (showFiltersDialog) {
      setTempFilters(filters)
    }
  }, [filters, showFiltersDialog])

  const totalItems = total ?? exams.length
  const totalPages = totalItems ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1
  const canPrevPage = page > 1
  const canNextPage = page < totalPages

  const subjectOptions = useMemo(
    () => availableSubjects.map((subject) => ({ id: subject.subject_id, name: subject.subject_name })),
    [availableSubjects]
  )

  const difficultyOptions = useMemo<SelectOption[]>(() => {
    const values = availableDifficulties.length ? availableDifficulties : ["EASY", "MEDIUM", "HARD", "MIXED"]
    return values.map((value) => ({
      value,
      label: DIFFICULTY_LABELS[value] ?? value,
    }))
  }, [availableDifficulties])

  const statusOptions = useMemo<SelectOption[]>(() => {
    const values = availableStatuses.length ? availableStatuses : ["UNDER_REVIEW", "APPROVED", "REJECTED", "DRAFT"]
    return values.map((value) => ({
      value,
      label: STATUS_LABELS[value] ?? value,
    }))
  }, [availableStatuses])

  const handleApplyFilters = () => {
    setFilters(tempFilters)
    setShowFiltersDialog(false)
  }

  const handleOpenFiltersDialog = () => {
    setTempFilters(filters)
    setShowFiltersDialog(true)
  }

  const changePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage === page || nextPage > totalPages) return
    setPage(nextPage)
  }

  const isEmpty = !loading && exams.length === 0

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <ExamBankHeader />

        <div className="mb-6 flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar exámenes..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleOpenFiltersDialog}>
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive">
            No se pudieron cargar los exámenes: {error.message}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando exámenes...</p>
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          <ExamList
            exams={exams}
          />
        )}

        {!isEmpty && !loading && (
          <div className="mt-6 pt-4 border-t flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {exams.length} de {totalItems || exams.length} exámenes.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(page - 1)}
                disabled={loading || !canPrevPage}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(page + 1)}
                disabled={loading || !canNextPage}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      <ExamFiltersDialog
        open={showFiltersDialog}
        onOpenChange={setShowFiltersDialog}
        filters={tempFilters}
        onFiltersChange={setTempFilters}
        availableAuthors={availableAuthors}
        availableSubjects={subjectOptions}
        availableStatuses={statusOptions}
        availableDifficulties={difficultyOptions}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  )
}
