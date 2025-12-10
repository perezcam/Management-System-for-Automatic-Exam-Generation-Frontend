"use client";

import type { ReactNode } from "react";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export type ReportPageShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function ReportPageShell({
  title,
  description,
  actions,
  children,
  className,
}: ReportPageShellProps) {
  const router = useRouter();

  return (
    <div className={className ?? ""}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <Button variant="ghost" onClick={() => router.push("/administration/reports")}>
            Volver
          </Button>
        </div>
      </div>
      <div className="mt-6 space-y-6">{children}</div>
    </div>
  );
}
