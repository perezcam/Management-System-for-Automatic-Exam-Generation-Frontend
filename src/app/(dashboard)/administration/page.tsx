import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Users, Shield, Bell, Database, FileText } from "lucide-react"

export default function AdministracionView() {
  const adminSections = [
    {
      title: "Gestión de Usuarios",
      description: "Administra profesores, coordinadores y permisos",
      icon: Users,
      color: "blue"
    },
    {
      title: "Configuración del Sistema",
      description: "Ajusta las preferencias y configuraciones generales",
      icon: Settings,
      color: "purple"
    },
    {
      title: "Seguridad y Permisos",
      description: "Configura roles y políticas de acceso",
      icon: Shield,
      color: "red"
    },
    {
      title: "Notificaciones",
      description: "Gestiona alertas y comunicaciones del sistema",
      icon: Bell,
      color: "yellow"
    },
    {
      title: "Respaldos",
      description: "Administra copias de seguridad de datos",
      icon: Database,
      color: "green"
    },
    {
      title: "Reportes",
      description: "Genera y visualiza reportes del sistema",
      icon: FileText,
      color: "orange"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      purple: "bg-purple-100 text-purple-600",
      red: "bg-red-100 text-red-600",
      yellow: "bg-yellow-100 text-yellow-600",
      green: "bg-green-100 text-green-600",
      orange: "bg-orange-100 text-orange-600"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl mb-2">Administración</h1>
          <p className="text-muted-foreground">
            Panel de control y configuración del sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section, index) => {
            const Icon = section.icon
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex flex-col items-start">
                  <div className={`p-3 rounded-lg mb-4 ${getColorClasses(section.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg mb-2">{section.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                  <Button variant="outline" size="sm" className="mt-auto">
                    Configurar
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="mt-6 p-6">
          <h2 className="text-lg mb-4">Actividad Reciente del Sistema</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p>Sistema actualizado a la versión 2.0</p>
                <p className="text-xs text-muted-foreground">Hace 2 días</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p>Nuevo usuario agregado: Prof. Carmen Silva</p>
                <p className="text-xs text-muted-foreground">Hace 5 días</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p>Respaldo automático completado</p>
                <p className="text-xs text-muted-foreground">Hace 1 semana</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
