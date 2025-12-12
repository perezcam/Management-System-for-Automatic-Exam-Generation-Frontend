"use client";

import { ReportsView } from "@/components/dashboard/administration/reports/reports-view";

export default function ReportsAdminPage() {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">Reportes</h2>
        </div>
        <ReportsView />
      </div>
    </div>
  );
}
