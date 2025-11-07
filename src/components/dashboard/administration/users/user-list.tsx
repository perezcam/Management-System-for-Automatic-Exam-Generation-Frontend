'use client';

import { Card } from "../../../ui/card"
import { Input } from "../../../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../ui/dialog"
import { Button } from "../../../ui/button"
import { Label } from "../../../ui/label"
import { Badge } from "../../../ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../ui/alert-dialog"
import { Users, Edit2, Trash2, Search } from "lucide-react"
import { useState } from "react"
import type { User } from "./user-registration-form"

interface UserListProps {
  users: User[]
  onUpdateUser: (userId: string, updates: Partial<User>) => void
  onDeleteUser: (userId: string) => void
}

export function UserList({ users, onUpdateUser, onDeleteUser }: UserListProps) {
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [userRoleFilter, setUserRoleFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({ username: "", role: "" })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Administrador":
        return "bg-red-100 text-red-700 hover:bg-red-100"
      case "Estudiante":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100"
      case "Profesor":
        return "bg-green-100 text-green-700 hover:bg-green-100"
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100"
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setEditForm({ username: user.username, role: user.role })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = () => {
    setIsEditDialogOpen(false)
    setIsDeleteDialogOpen(true)
  }

  const handleEditUser = () => {
    if (selectedUser && editForm.username) {
      onUpdateUser(selectedUser.id, { username: editForm.username, role: editForm.role })
      setIsEditDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const handleDeleteUser = () => {
    if (selectedUser) {
      onDeleteUser(selectedUser.id)
      setIsDeleteDialogOpen(false)
      setIsEditDialogOpen(false)
      setSelectedUser(null)
    }
  }

  return (
    <>
      <Card className="p-6">
        <h2 className="text-lg mb-4">Usuarios del Sistema</h2>
        
        {/* Búsqueda y Filtro */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-9 text-muted-foreground" />
            <Input
              placeholder="Buscar por username..."
              className="pl-10"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
            />
          </div>
          <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="Administrador">Administrador</SelectItem>
              <SelectItem value="Estudiante">Estudiante</SelectItem>
              <SelectItem value="Profesor">Profesor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {users
            .filter(user => 
              user.username.toLowerCase().includes(userSearchQuery.toLowerCase()) &&
              (userRoleFilter === "all" || user.role === userRoleFilter)
            )
            .map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => openEditDialog(user)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {user.nombre || user.username}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.role === "Estudiante" && user.edad && user.curso && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {user.edad} años • {user.curso}
                        </p>
                      )}
                      {user.role === "Profesor" && user.especialidad && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {user.especialidad}
                          {user.rolesProfesor && user.rolesProfesor.length > 0 && (
                            <> • {user.rolesProfesor.join(", ")}</>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* Dialog de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica el username o el rol del usuario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                placeholder="Ingrese username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rol</Label>
              <Select value={editForm.role} onValueChange={(value:string) => setEditForm({ ...editForm, role: value })}>
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
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="destructive" onClick={openDeleteDialog}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Usuario
            </Button>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser}>
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esta acción eliminará permanentemente el usuario del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
