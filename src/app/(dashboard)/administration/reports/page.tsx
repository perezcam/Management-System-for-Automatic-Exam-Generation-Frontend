"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ReportsView } from "@/components/dashboard/administration/reports/reports-view";

export default function ReportsAdminPage() {
  const router = useRouter();
  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">Reportes</h2>
          <Button variant="ghost" onClick={() => router.push("/administration")}>
            Volver
          </Button>
        </div>
        <ReportsView onBack={() => void router.push("/administration")} />
      </div>
    </div>
  );
}
