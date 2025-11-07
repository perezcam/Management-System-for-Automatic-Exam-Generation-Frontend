"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MailSidebar } from "@/components/dashboard/mail-sidebar";
import { MailHeader } from "@/components/dashboard/mail-header";
import { FOLDER_TO_ROUTE, type FolderKey } from "@/utils/access";

export default function DashboardShell({
  children,
  allowedKeys,
}: {
  children: React.ReactNode;
  allowedKeys: FolderKey[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  const selectedFolder = useMemo(() => {
    const entry = Object.entries(FOLDER_TO_ROUTE).find(([, route]) =>
      pathname?.startsWith(route)
    );
    return (entry?.[0] as FolderKey) ?? "messaging";
  }, [pathname]);

  const handleFolderSelect = (folder: FolderKey) => {
    if (!allowedKeys.includes(folder)) return; 
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
          allowedKeys={allowedKeys}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
