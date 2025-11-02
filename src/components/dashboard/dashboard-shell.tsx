"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MailSidebar } from "@/components/dashboard/mail-sidebar";
import { MailHeader } from "@/components/dashboard/mail-header";

const FOLDER_TO_ROUTE: Record<string, string> = {
  "messaging": "/messaging",
  "pending-exams": "/pending_exams",
  "statistics": "/statistics",
  "administration": "/administration",
  "exam-bank": "/exam_bank",
  "question-generator": "/question_generator",
  "exam-generator": "/exam_generator",
  "question-bank": "/question_bank",
  "configuration": "/configuration",
  "subjects": "/subjects",
  "exams": "/exams",
};

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const selectedFolder = useMemo(() => {
    const entry = Object.entries(FOLDER_TO_ROUTE).find(([, route]) =>
      pathname?.startsWith(route)
    );
    return entry?.[0] ?? "messaging";
  }, [pathname]);

  const handleFolderSelect = (folder: string) => {
    const route = FOLDER_TO_ROUTE[folder] ?? "/messaging";
    router.push(route);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <MailHeader />
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
