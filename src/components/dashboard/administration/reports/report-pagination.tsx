"use client";

import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types/backend-responses";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type ReportPaginationProps = {
  meta: PaginationMeta | null;
  page: number;
  onPageChange: (page: number) => void;
};

export function ReportPagination({ meta, page, onPageChange }: ReportPaginationProps) {
  const limit = meta?.limit ?? 0;
  const total = meta?.total ?? 0;
  const totalPages = limit === 0 ? 1 : Math.max(1, Math.ceil(total / limit));
  const startIndex = limit === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(total, page * limit);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-muted-foreground">
        {total === 0
          ? "Sin resultados"
          : `Mostrando ${startIndex}-${endIndex} de ${total} elementos`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
