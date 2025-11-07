'use client';

import { Card } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import { Checkbox } from "../../../ui/checkbox"
import { Plus, AlertCircle } from "lucide-react"
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
  asignaturas?: string[]
}

interface UserRegistrationFormProps {
  onCreateUser: (user: User) => void
  subjects?: { id: string; name: string }[]
}

export function UserRegistrationForm({ onCreateUser, subjects = [] }: UserRegistrationFormProps) {
  const [userType, setUserType] = useState<"Administrador" | "Estudiante" | "Profesor">("Administrador")
  const [newUser, setNewUser] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    nombre: "",
    edad: "",
    curso: "",
    especialidad: "",
    rolesProfesor: [] as string[],
    asignaturas: [] as string[]
  })

  const toggleRolProfesor = (rol: string) => {
    setNewUser(prev => {
      const newRoles = prev.rolesProfesor.includes(rol)
        ? prev.rolesProfesor.filter(r => r !== rol)
        : [...prev.rolesProfesor, rol]
      
      // Si se deselecciona "Jefe de Asignatura", limpiar las asignaturas
      if (rol === "Jefe de Asignatura" && !newRoles.includes("Jefe de Asignatura")) {
        return {
          ...prev,
          rolesProfesor: newRoles,
          asignaturas: []
        }
      }
      
      return {
        ...prev,
        rolesProfesor: newRoles
      }
    })
  }

  const toggleAsignatura = (asignaturaId: string) => {
    setNewUser(prev => ({
      ...prev,
      asignaturas: prev.asignaturas.includes(asignaturaId)
        ? prev.asignaturas.filter(a => a !== asignaturaId)
        : [...prev.asignaturas, asignaturaId]
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
        if (newUser.rolesProfesor.includes("Jefe de Asignatura")) {
          user.asignaturas = newUser.asignaturas
        }
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
        rolesProfesor: [],
        asignaturas: []
      })
      setUserType("Administrador")
    }
  }

  // Verificar si el formulario es válido para enviar
  const isFormValid = () => {
    // Validación básica
    if (!newUser.username || !newUser.email || !newUser.password) {
      return false
    }

    // Validaciones específicas por tipo de usuario
    if (userType === "Estudiante" && (!newUser.nombre || !newUser.edad || !newUser.curso)) {
      return false
    }

    if (userType === "Profesor") {
      if (!newUser.nombre || !newUser.especialidad) {
        return false
      }
      // Si es Jefe de Asignatura, debe tener al menos una asignatura seleccionada
      if (newUser.rolesProfesor.includes("Jefe de Asignatura") && newUser.asignaturas.length === 0) {
        return false
      }
    }

    return true
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
            {/* Asignaturas para Jefe de Asignatura */}
            {newUser.rolesProfesor.includes("Jefe de Asignatura") && (
              <div className="space-y-2">
                <Label>Asignaturas {newUser.asignaturas.length > 0 && `(${newUser.asignaturas.length} seleccionada${newUser.asignaturas.length > 1 ? 's' : ''})`}</Label>
                {subjects.length > 0 ? (
                  <>
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                      {subjects.map(subject => (
                        <div key={subject.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={subject.id}
                            checked={newUser.asignaturas.includes(subject.id)}
                            onCheckedChange={() => toggleAsignatura(subject.id)}
                          />
                          <label
                            htmlFor={subject.id}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                          >
                            {subject.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    {newUser.asignaturas.length === 0 && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-800">
                          Debe seleccionar al menos una asignatura para el rol de Jefe de Asignatura
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground p-3 border rounded-md">
                    No hay asignaturas disponibles. Crea asignaturas en la sección de Configuración de Preguntas.
                  </p>
                )}
              </div>
            )}
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
        <Button type="submit" className="w-full" disabled={!isFormValid()}>
          <Plus className="h-4 w-4 mr-2" />
          Crear {userType}
        </Button>
      </form>
    </Card>
  )
}