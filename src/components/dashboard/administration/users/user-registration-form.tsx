import { Card } from "../../ui/card"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Checkbox } from "../../ui/checkbox"
import { Plus } from "lucide-react"
import { useState } from "react"

export type User = {
  id: string
  username: string
  email: string
  role: string
  nombre?: string
  edad?: number
  curso?: string
  especialidad?: string
  rolesProfesor?: string[]
}

interface UserRegistrationFormProps {
  onCreateUser: (user: User) => void
}

export function UserRegistrationForm({ onCreateUser }: UserRegistrationFormProps) {
  const [userType, setUserType] = useState<"Administrador" | "Estudiante" | "Profesor">("Administrador")
  const [newUser, setNewUser] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    nombre: "",
    edad: "",
    curso: "",
    especialidad: "",
    rolesProfesor: [] as string[]
  })

  const toggleRolProfesor = (rol: string) => {
    setNewUser(prev => ({
      ...prev,
      rolesProfesor: prev.rolesProfesor.includes(rol)
        ? prev.rolesProfesor.filter(r => r !== rol)
        : [...prev.rolesProfesor, rol]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newUser.username && newUser.email && newUser.password) {
      const user: User = {
        id: String(Date.now()),
        username: newUser.username,
        email: newUser.email,
        role: userType
      }

      // Agregar campos específicos según el tipo de usuario
      if (userType === "Estudiante") {
        user.nombre = newUser.nombre
        user.edad = Number(newUser.edad)
        user.curso = newUser.curso
      } else if (userType === "Profesor") {
        user.nombre = newUser.nombre
        user.especialidad = newUser.especialidad
        user.rolesProfesor = newUser.rolesProfesor
      }

      onCreateUser(user)
      
      // Reset form
      setNewUser({ 
        username: "", 
        email: "", 
        password: "", 
        nombre: "",
        edad: "",
        curso: "",
        especialidad: "",
        rolesProfesor: []
      })
      setUserType("Administrador")
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Plus className="h-5 w-5" />
        <h2 className="text-lg">Registrar Nuevo Usuario</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userType">Tipo de Usuario</Label>
          <Select value={userType} onValueChange={(value: "Administrador" | "Estudiante" | "Profesor") => setUserType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Administrador">Administrador</SelectItem>
              <SelectItem value="Estudiante">Estudiante</SelectItem>
              <SelectItem value="Profesor">Profesor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Campos específicos para Estudiante y Profesor */}
        {(userType === "Estudiante" || userType === "Profesor") && (
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo</Label>
            <Input
              id="nombre"
              value={newUser.nombre}
              onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
              placeholder="Ingrese nombre completo"
              required
            />
          </div>
        )}

        {/* Campos específicos para Estudiante */}
        {userType === "Estudiante" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="edad">Edad</Label>
              <Input
                id="edad"
                type="number"
                value={newUser.edad}
                onChange={(e) => setNewUser({ ...newUser, edad: e.target.value })}
                placeholder="Ingrese edad"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="curso">Curso</Label>
              <Input
                id="curso"
                value={newUser.curso}
                onChange={(e) => setNewUser({ ...newUser, curso: e.target.value })}
                placeholder="Ej: 3er Año"
                required
              />
            </div>
          </>
        )}

        {/* Campos específicos para Profesor */}
        {userType === "Profesor" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="especialidad">Especialidad</Label>
              <Input
                id="especialidad"
                value={newUser.especialidad}
                onChange={(e) => setNewUser({ ...newUser, especialidad: e.target.value })}
                placeholder="Ingrese especialidad"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Roles de Profesor</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="examinador"
                    checked={newUser.rolesProfesor.includes("Examinador")}
                    onCheckedChange={() => toggleRolProfesor("Examinador")}
                  />
                  <label
                    htmlFor="examinador"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Examinador
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="jefe"
                    checked={newUser.rolesProfesor.includes("Jefe de Asignatura")}
                    onCheckedChange={() => toggleRolProfesor("Jefe de Asignatura")}
                  />
                  <label
                    htmlFor="jefe"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Jefe de Asignatura
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Campos comunes para todos */}
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            placeholder="Ingrese username"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            placeholder="usuario@universidad.edu"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            placeholder="••••••••"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Crear {userType}
        </Button>
      </form>
    </Card>
  )
}
