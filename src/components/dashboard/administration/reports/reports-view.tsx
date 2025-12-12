"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Activity,
  BarChart3,
  Cpu,
  List,
  Scale,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";

const REPORTS = [
  {
    title: "Exámenes automáticos",
    description: "Revisa la trazabilidad y parámetros de los exámenes generados automáticamente.",
    href: "/reports/automatic-exams",
    icon: Cpu,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "Preguntas más usadas",
    description: "Identifica cuáles son las preguntas que aparecen más veces en evaluaciones.",
    href: "/reports/popular-questions",
    icon: List,
    color: "bg-fuchsia-100 text-fuchsia-700",
  },
  {
    title: "Exámenes validados",
    description: "Observa qué revisores validaron exámenes y en qué asignatura.",
    href: "/reports/validated-exams",
    icon: ShieldCheck,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Desempeño por examen",
    description: "Profundiza en indicadores de éxito y dificultad por pregunta.",
    href: "/reports/exam-performance",
    icon: Activity,
    color: "bg-sky-100 text-sky-600",
  },
  {
    title: "Dificultad por asignatura",
    description: "Cruza correlaciones entre dificultad y promedio por materia.",
    href: "/reports/subject-difficulty",
    icon: BarChart3,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Comparación de exámenes",
    description: "Analiza el balance y cobertura de distintos exámenes.",
    href: "/reports/exam-comparison",
    icon: Scale,
    color: "bg-cyan-100 text-cyan-700",
  },
  {
    title: "Actividad de revisores",
    description: "Consulta cuántos exámenes revisó cada profesor y por asignatura.",
    href: "/reports/reviewer-activity",
    icon: UserCheck,
    color: "bg-amber-100 text-amber-600",
  },
];

export function ReportsView() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {REPORTS.map(({ title, description, href, icon: Icon, color }) => (
        <Card
          key={href}
          className="border-transparent shadow-sm cursor-pointer transition hover:shadow-lg"
          onClick={() => router.push(href)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              router.push(href);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </div>
            <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>
            <Button
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                router.push(href);
              }}
            >
              Abrir reporte
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
