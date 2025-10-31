"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MailSidebar } from "@/components/mail-sidebar";
import { MailHeader } from "@/components/mail-header";

const FOLDER_TO_ROUTE: Record<string, string> = {
  "pruebas-aprobar": "/pending_exams",
  mensajeria: "/messaging",
  "estadisticas-curso": "/statistics",
  "admin-profesores": "/teachers_administration",
  "banco-examenes": "/exam_bank",
  "generador-preguntas": "/question_generator",
  "generador-examenes": "/exam_generator",
  "banco-preguntas": "/question_bank",
  administracion: "/administration",
};

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const selectedFolder = useMemo(() => {
    const entry = Object.entries(FOLDER_TO_ROUTE).find(([, route]) =>
      pathname?.startsWith(route)
    );
    return entry?.[0] ?? "pruebas-aprobar";
  }, [pathname]);

  const handleFolderSelect = (folder: string) => {
    const route = FOLDER_TO_ROUTE[folder] ?? "/dashboard/pending_exams";
    router.push(route);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <MailHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="flex flex-1 overflow-hidden">
        <MailSidebar
          selectedFolder={selectedFolder}
          onFolderSelect={handleFolderSelect}
          onCompose={() => {}}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
