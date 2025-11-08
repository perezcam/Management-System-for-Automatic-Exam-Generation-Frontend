import { useMemo, useState } from "react";
import { Card } from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Label } from "../../../ui/label";
import { Badge } from "../../../ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog";
import { Checkbox } from "../../../ui/checkbox";
import { Users, Edit2, Trash2, Search } from "lucide-react";
import type {
  UpdateAdminPayload,
  UpdateStudentPayload,
  UpdateTeacherPayload,
  UserRecord,
  UserRole,
} from "@/types/users";

type RoleFilter = "all" | UserRole;

interface SubjectOption {
  id: string;
  name: string;
}

interface UserListProps {
  users: UserRecord[];
  subjects?: SubjectOption[];
  onUpdateAdmin: (adminId: string, payload: UpdateAdminPayload) => Promise<void> | void;
  onUpdateStudent: (studentId: string, payload: UpdateStudentPayload) => Promise<void> | void;
  onUpdateTeacher: (teacherId: string, payload: UpdateTeacherPayload) => Promise<void> | void;
  onDeleteAdmin: (adminId: string) => Promise<void> | void;
  onDeleteStudent: (studentId: string) => Promise<void> | void;
  onDeleteTeacher: (teacherId: string) => Promise<void> | void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  student: "Estudiante",
  teacher: "Profesor",
};

const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-700 border-transparent hover:bg-red-100",
  student: "bg-blue-100 text-blue-700 border-transparent hover:bg-blue-100",
  teacher: "bg-emerald-100 text-emerald-700 border-transparent hover:bg-emerald-100",
};

export function UserList({
  users,
  subjects = [],
  onUpdateAdmin,
  onUpdateStudent,
  onUpdateTeacher,
  onDeleteAdmin,
  onDeleteStudent,
  onDeleteTeacher,
}: UserListProps) {
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<RoleFilter>("all");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    age: "",
    course: "",
    specialty: "",
    hasRoleExaminer: false,
    hasRoleSubjectLeader: false,
    subjects: [] as string[],
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesQuery = user.name.toLowerCase().includes(userSearchQuery.toLowerCase());
      const matchesRole = userRoleFilter === "all" || user.role === userRoleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, userSearchQuery, userRoleFilter]);

  const openEditDialog = (user: UserRecord) => {
    setSelectedUser(user);
    if (user.role === "admin") {
      setEditForm({
        name: user.name,
        email: user.email,
        age: "",
        course: "",
        specialty: "",
        hasRoleExaminer: false,
        hasRoleSubjectLeader: false,
        subjects: [],
      });
    } else if (user.role === "student") {
      setEditForm({
        name: user.name,
        email: user.email,
        age: String(user.age),
        course: user.course,
        specialty: "",
        hasRoleExaminer: false,
        hasRoleSubjectLeader: false,
        subjects: [],
      });
    } else {
      setEditForm({
        name: user.name,
        email: user.email,
        age: "",
        course: "",
        specialty: user.specialty,
        hasRoleExaminer: user.hasRoleExaminer,
        hasRoleSubjectLeader: user.hasRoleSubjectLeader,
        subjects: user.subjects_ids ?? [],
      });
    }

    setIsEditDialogOpen(true);
  };

  const closeDialogs = () => {
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setIsUpdatingUser(true);
    try {
      if (selectedUser.role === "admin") {
        const payload: UpdateAdminPayload = {
          name: editForm.name,
          email: editForm.email,
        };
        await onUpdateAdmin(selectedUser.id, payload);
      } else if (selectedUser.role === "student") {
        const payload: UpdateStudentPayload = {
          name: editForm.name,
          email: editForm.email,
          age: editForm.age ? Number(editForm.age) : undefined,
          course: editForm.course || undefined,
        };
        await onUpdateStudent(selectedUser.id, payload);
      } else {
        const payload: UpdateTeacherPayload = {
          name: editForm.name,
          email: editForm.email,
          specialty: editForm.specialty,
          hasRoleExaminer: editForm.hasRoleExaminer,
          hasRoleSubjectLeader: editForm.hasRoleSubjectLeader,
          subjects_ids: editForm.hasRoleSubjectLeader ? editForm.subjects : [],
        };
        await onUpdateTeacher(selectedUser.id, payload);
      }
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsDeletingUser(true);
    try {
      if (selectedUser.role === "admin") {
        await onDeleteAdmin(selectedUser.id);
      } else if (selectedUser.role === "student") {
        await onDeleteStudent(selectedUser.id);
      } else {
        await onDeleteTeacher(selectedUser.id);
      }
      closeDialogs();
    } finally {
      setIsDeletingUser(false);
    }
  };

  const renderUserExtraInfo = (user: UserRecord) => {
    if (user.role === "student") {
      return (
        <p className="text-xs text-muted-foreground mt-1">
          {user.age} años • {user.course}
        </p>
      );
    }
    if (user.role === "teacher") {
      const roles: string[] = [];
      if (user.hasRoleExaminer) roles.push("Examinador");
      if (user.hasRoleSubjectLeader) roles.push("Jefe de Asignatura");

      return (
        <p className="text-xs text-muted-foreground mt-1">
          {user.specialty}
          {roles.length > 0 && ` • ${roles.join(", ")}`}
          {user.hasRoleSubjectLeader && user.subjects_names && user.subjects_names.length > 0 && (
            <> • Asignaturas: {user.subjects_names.join(", ")}</>
          )}
        </p>
      );
    }
    return null;
  };

  const renderEditFields = () => {
    if (!selectedUser) return null;

    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="edit-name">Nombre</Label>
          <Input
            id="edit-name"
            value={editForm.name}
            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Nombre completo"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-email">Correo</Label>
          <Input
            id="edit-email"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="usuario@universidad.edu"
          />
        </div>

        {selectedUser.role === "student" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="edit-age">Edad</Label>
              <Input
                id="edit-age"
                type="number"
                value={editForm.age}
                onChange={(e) => setEditForm((prev) => ({ ...prev, age: e.target.value }))}
                placeholder="Edad"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-course">Curso</Label>
              <Input
                id="edit-course"
                value={editForm.course}
                onChange={(e) => setEditForm((prev) => ({ ...prev, course: e.target.value }))}
                placeholder="Curso"
              />
            </div>
          </>
        )}

        {selectedUser.role === "teacher" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="edit-specialty">Especialidad</Label>
              <Input
                id="edit-specialty"
                value={editForm.specialty}
                onChange={(e) => setEditForm((prev) => ({ ...prev, specialty: e.target.value }))}
                placeholder="Especialidad"
              />
            </div>
            <div className="space-y-2">
              <Label>Roles</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-role-examiner"
                    checked={editForm.hasRoleExaminer}
                    onCheckedChange={(checked) =>
                      setEditForm((prev) => ({ ...prev, hasRoleExaminer: Boolean(checked) }))
                    }
                  />
                  <label htmlFor="edit-role-examiner" className="text-sm">
                    Examinador
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-role-leader"
                    checked={editForm.hasRoleSubjectLeader}
                    onCheckedChange={(checked) => {
                      setEditForm((prev) => ({
                        ...prev,
                        hasRoleSubjectLeader: Boolean(checked),
                        subjects: checked ? prev.subjects : [],
                      }));
                    }}
                  />
                  <label htmlFor="edit-role-leader" className="text-sm">
                    Jefe de Asignatura
                  </label>
                </div>
              </div>
            </div>
            {editForm.hasRoleSubjectLeader && (
              <div className="space-y-2">
                <Label>Asignaturas</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-subject-${subject.id}`}
                        checked={editForm.subjects.includes(subject.id)}
                        onCheckedChange={() => {
                          const exists = editForm.subjects.includes(subject.id);
                          setEditForm((prev) => ({
                            ...prev,
                            subjects: exists
                              ? prev.subjects.filter((id) => id !== subject.id)
                              : [...prev.subjects, subject.id],
                          }));
                        }}
                      />
                      <label htmlFor={`edit-subject-${subject.id}`} className="text-sm flex-1 cursor-pointer">
                        {subject.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <>
      <Card className="p-6">
        <h2 className="text-lg mb-4">Usuarios del Sistema</h2>
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre..."
              className="pl-10"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
            />
          </div>
          <Select value={userRoleFilter} onValueChange={(value) => setUserRoleFilter(value as RoleFilter)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="student">Estudiante</SelectItem>
              <SelectItem value="teacher">Profesor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <div
              key={`${user.role}-${user.id}`}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
              onClick={() => openEditDialog(user)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {renderUserExtraInfo(user)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={ROLE_BADGE_CLASSES[user.role]}>
                  {ROLE_LABELS[user.role]}
                </Badge>
                <Edit2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedUser(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Actualiza los datos del usuario seleccionado.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">{renderEditFields()}</div>
          <div className="flex justify-end gap-3">
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeletingUser}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Usuario
            </Button>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser} disabled={isUpdatingUser}>
              {isUpdatingUser ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El usuario será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeletingUser}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={isDeletingUser}>
              {isDeletingUser ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
