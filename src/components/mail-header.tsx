import { Button } from "./ui/button"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Settings, HelpCircle } from "lucide-react"

export function MailHeader() {
  return (
    <div className="border-b p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">Mauricio Medina Hernández</h2>
          <p className="text-sm text-muted-foreground">Dr. en Ciencia de la Computación</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback>MM</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}