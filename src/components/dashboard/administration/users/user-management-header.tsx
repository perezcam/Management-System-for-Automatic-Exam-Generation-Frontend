import { ArrowLeft } from "lucide-react"
import { Button } from "../../../ui/button"

interface UserManagementHeaderProps {
  onBack: () => void
}

export function UserManagementHeader({ onBack }: UserManagementHeaderProps) {
  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl mb-2">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">
          Gestiona usuarios del sistema
        </p>
      </div>
    </>
  )
}
