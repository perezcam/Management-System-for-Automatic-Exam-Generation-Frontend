"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

export function MailHeader() {
  const [name, setName] = useState("Usuario");
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setName(d?.name || "Bienvenido"))
      .catch(() => setName("Bienvenido"));
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <div className="border-b p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">{name}</h2>
          <p className="text-sm text-muted-foreground">MSFAEG</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {loggingOut ? "Cerrando..." : "Cerrar Sesión"}
          </Button>
        </div>
      </div>
    </div>
  );
}
