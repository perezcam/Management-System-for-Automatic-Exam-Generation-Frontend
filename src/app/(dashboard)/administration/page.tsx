'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, Settings } from "lucide-react"
import { useRouter } from "next/navigation";


export default function AdministrationPage() {
  const router = useRouter();

  const sections = [
    {
      title: "Gestión de Usuarios",
      description: "Administra profesores, coordinadores y permisos",
      icon: Users,
      color: "blue",
      href: "/administration/users",
    },
    {
      title: "Configuración de Preguntas",
      description: "Gestiona tipos de preguntas, tópicos y subtópicos",
      icon: Settings,
      color: "purple",
      href: "/administration/questions",
    },
    {
      title: "Reportes",
      description: "Genera y visualiza reportes del sistema",
      icon: FileText,
      color: "orange",
      href: "/administration/reports",
    },
  ] as const;

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-100 text-blue-600",
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600",
    };
    return colors[color] ?? colors.blue;
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl mb-2">Administración</h1>
          <p className="text-muted-foreground">
            Panel de control y configuración del sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map(({ title, description, icon: Icon, color, href }) => (
            <Card
              key={href}
              role="button"
              tabIndex={0}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(href)}
              onMouseEnter={() => router.prefetch?.(href)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(href);
                }
              }}
            >
              <div className="flex flex-col items-start">
                <div className={`p-3 rounded-lg mb-4 ${getColorClasses(color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {description}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation(); // evita navegar dos veces
                    router.push(href);
                  }}
                >
                  Abrir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
