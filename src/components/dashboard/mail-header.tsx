"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

export function MailHeader() {
  const [name, setName] = useState("Usuario");

  useEffect(() => {
    fetch("/api/me", {
      cache: "no-store",
    })
      .then(r => r.json())
      .then(d => setName(d?.name || "Bienvenido"))
      .catch(() => setName("Bienvenido"));
  }, []);


  return (
    <div className="border-b p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">{name}</h2>
          <p className="text-sm text-muted-foreground">ExamPro</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
