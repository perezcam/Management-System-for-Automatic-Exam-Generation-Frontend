import { cookies } from "next/headers";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Settings, HelpCircle } from "lucide-react";

export async function MailHeader() {
  const r = await fetch("/api/me", {
    cache: "no-store",
    headers: { cookie: cookies().toString() },
  });

  const data = r.ok ? await r.json() : { name: "Usuario" };
  const name: string = data.name ?? "Usuario";

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
