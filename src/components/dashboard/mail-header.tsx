"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Settings, HelpCircle } from "lucide-react";

export function MailHeader() {
  const [name, setName] = useState("Usuario");

  useEffect(() => {
    fetch("/api/me", {
      cache: "no-store",
    })
      .then(r => r.json())
      .then(d => setName(d?.name || "Usuario"))
      .catch(() => setName("Usuario"));
  }, []);

  const initials =
    name.split(" ").filter(Boolean).map(w => w[0]?.toUpperCase()).slice(0, 2).join("") || "U";

  return (
    <div className="border-b p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">{name}</h2>
          <p className="text-sm text-muted-foreground">Dr. en Ciencia de la Computación</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm"><Settings className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm"><HelpCircle className="h-4 w-4" /></Button>
          <Avatar className="h-8 w-8"><AvatarFallback>{initials}</AvatarFallback></Avatar>
        </div>
      </div>
    </div>
  );
}
