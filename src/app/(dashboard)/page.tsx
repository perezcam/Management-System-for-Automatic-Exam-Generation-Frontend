import { useState } from "react"
import { MailSidebar } from "@/components/mail-sidebar"
import { MailHeader } from "@/components/mail-header"
import { PruebasAprobarView } from "@/components/views/pruebas-aprobar-view"
import { MensajeriaView } from "@/components/views/mensajeria-view"
import { EstadisticasCursoView } from "@/components/views/estadisticas-curso-view"
import { AdminProfesoresView } from "@/components/views/admin-profesores-view"
import { BancoExamenesView } from "@/components/views/banco-examenes-view"
import { GeneradorPreguntasView } from "@/components/views/generador-preguntas-view"
import { GeneradorExamenesView } from "@/components/views/generador-examenes-view"
import { BancoPreguntasView } from "@/components/views/banco-preguntas-view"
import { AdministracionView } from "@/components/views/administracion-view"

export default function App() {
  const [selectedFolder, setSelectedFolder] = useState("pruebas-aprobar")
  const [searchQuery, setSearchQuery] = useState("")

  // Renderizar el componente correspondiente según la carpeta seleccionada
  const renderView = () => {
    switch (selectedFolder) {
      case "pruebas-aprobar":
        return <PruebasAprobarView />
      case "mensajeria":
        return <MensajeriaView />
      case "estadisticas-curso":
        return <EstadisticasCursoView />
      case "admin-profesores":
        return <AdminProfesoresView />
      case "banco-examenes":
        return <BancoExamenesView />
      case "generador-preguntas":
        return <GeneradorPreguntasView />
      case "generador-examenes":
        return <GeneradorExamenesView />
      case "banco-preguntas":
        return <BancoPreguntasView />
      case "administracion":
        return <AdministracionView />
      default:
        return <PruebasAprobarView />
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <MailHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="flex flex-1 overflow-hidden">
        <MailSidebar
          selectedFolder={selectedFolder}
          onFolderSelect={setSelectedFolder}
          onCompose={() => {}}
        />
        
        {renderView()}
      </div>
    </div>
  )
}
