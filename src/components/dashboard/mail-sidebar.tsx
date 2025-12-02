import { Button } from "../ui/button";
import {
  ClipboardCheck, MessageSquare, BarChart3, Database, FileText, FileStack, FileCheck, Shield
} from "lucide-react";
import type { FolderKey } from "@/utils/access";

interface MailSidebarProps {
  selectedFolder: FolderKey;
  onFolderSelect: (folder: FolderKey) => void;
  onCompose: () => void;
  allowedKeys: FolderKey[];
}

export function MailSidebar({ selectedFolder, onFolderSelect, allowedKeys }: MailSidebarProps) {
  const folders: { id: FolderKey; name: string; icon: typeof MessageSquare }[] = [
    { id: "messaging", name: "Mensajería", icon: MessageSquare },
    { id: "exams", name: "Pruebas", icon: FileCheck },
    { id: "regrade", name: "Revisiones", icon: FileText },
    { id: "question-bank", name: "Banco de Preguntas", icon: Database },
    { id: "exam-bank", name: "Banco de Exámenes", icon: FileStack },
    { id: "pending-exams", name: "Pruebas a Aprobar", icon: ClipboardCheck },
    { id: "statistics", name: "Estadísticas de Curso", icon: BarChart3 },
    { id: "administration", name: "Administración", icon: Shield },
  ];

  const visible = folders.filter(f => allowedKeys.includes(f.id));

  return (
    <div className="w-64 border-r bg-muted/20 p-4">
      <div className="space-y-2">
        {visible.map((folder) => {
          const Icon = folder.icon;
          return (
            <Button
              key={folder.id}
              variant={selectedFolder === folder.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onFolderSelect(folder.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span className="flex-1 text-left">{folder.name}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
