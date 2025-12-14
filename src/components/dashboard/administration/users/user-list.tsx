import { useEffect, useMemo, useState } from "react";
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
import { Users, Edit2, Trash2, Search, Plus, X } from "lucide-react";
import type {
  AdminUser,
  StudentUser,
  TeacherUser,
  UpdateAdminPayload,
  UpdateStudentPayload,
  UpdateTeacherPayload,
  UserSummary,
  UserRole,
  User,
} from "@/types/users/users";
import type { PaginationMeta } from "@/types/backend-responses";
import { fetchAdminDetail } from "@/services/users/admins";
import { fetchStudentDetail } from "@/services/users/student";
import { fetchTeacherDetail } from "@/services/users/teachers";

type RoleFilter = "all" | UserRole;

interface SubjectOption {
  id: string;
  name: string;
}

type DisplayUser = UserSummary | User;

type SelectedUserInfo = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type PaginatedList<T extends DisplayUser> = {
  data: T[];
  meta: PaginationMeta | null;
  page: number;
  pageSize: number;
  filter: string;
  loading: boolean;
  error: Error | null;
  setPage: (page: number) => void;
  refresh: () => Promise<void> | void;
  setFilter: (value: string) => void;
};

interface UserListProps {
  all: PaginatedList<UserSummary>;
  admins: PaginatedList<AdminUser>;
  students: PaginatedList<StudentUser>;
  teachers: PaginatedList<TeacherUser>;
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
  teacher: "bg-green-100 text-emerald-700 border-transparent hover:bg-emerald-100",
};

const FILTER_LABELS: Record<RoleFilter, string> = {
  all: "Usuarios",
  admin: ROLE_LABELS.admin,
  student: ROLE_LABELS.student,
  teacher: ROLE_LABELS.teacher,
};

const createEmptyEditForm = () => ({
  name: "",
  email: "",
  age: "",
  course: "",
  specialty: "",
  hasRoleExaminer: false,
  hasRoleSubjectLeader: false,
  subjects: [] as string[],
});

export function UserList({
  all,
  admins,
  students,
  teachers,
  subjects = [],
  onUpdateAdmin,
  onUpdateStudent,
  onUpdateTeacher,
  onDeleteAdmin,
  onDeleteStudent,
  onDeleteTeacher,
}: UserListProps) {
  const [userRoleFilter, setUserRoleFilter] = useState<RoleFilter>("all");
  const [searchValue, setSearchValue] = useState(all.filter);
  const [selectedUser, setSelectedUser] = useState<SelectedUserInfo | null>(null);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<RoleFilter>("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [subjectSelectKey, setSubjectSelectKey] = useState(0);
  const [editForm, setEditForm] = useState(createEmptyEditForm());

  const listMap: Record<RoleFilter, PaginatedList<DisplayUser>> = useMemo(() => ({
    all,
    admin: admins,
    student: students,
    teacher: teachers,
  }), [admins, all, students, teachers]);

  const currentList = listMap[userRoleFilter];
  const currentUsers = currentList.data;

  const currentLoading = currentList.loading || isRefreshing;
  const currentError = currentList.error;
  const currentFilterLabel = FILTER_LABELS[userRoleFilter];
  const currentMeta = currentList.meta;
  const currentPage = currentList.page;
  const totalItems = currentMeta?.total ?? currentUsers.length;
  const pageLimit = currentMeta?.limit && currentMeta.limit > 0 ? currentMeta.limit : currentList.pageSize;
  const totalPages = currentMeta ? Math.max(1, Math.ceil(currentMeta.total / pageLimit)) : 1;

  const handleRoleChange = (value: RoleFilter) => {
    setUserRoleFilter(value);
    if (value === "admin") {
      setSearchValue(admins.filter);
    } else if (value === "student") {
      setSearchValue(students.filter);
    } else if (value === "teacher") {
      setSearchValue(teachers.filter);
    } else {
      setSearchValue(all.filter);
    }
  };

  useEffect(() => {
    // Mantener el texto inicial coherente con el filtro del hook
    if (userRoleFilter === "admin") {
      setSearchValue(admins.filter);
    } else if (userRoleFilter === "student") {
      setSearchValue(students.filter);
    } else if (userRoleFilter === "teacher") {
      setSearchValue(teachers.filter);
    } else {
      setSearchValue(all.filter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshCurrentRole = async () => {
    setIsRefreshing(true);
    try {
      await currentList.refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const changePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage === currentPage || nextPage > totalPages) return;
    currentList.setPage(nextPage);
  };

  const loadUserDetails = async (role: RoleFilter, userId: string) => {
    setIsLoadingUserDetail(true);
    try {
      if (role === "student") {
        const detail = await fetchStudentDetail(userId);
        setEditForm({
          name: detail.name,
          email: detail.email,
          age: String(detail.age),
          course: String(detail.course),
          specialty: "",
          hasRoleExaminer: false,
          hasRoleSubjectLeader: false,
          subjects: [],
        });
      } else if (role === "teacher") {
        const detail = await fetchTeacherDetail(userId);
        setEditForm({
          name: detail.name,
          email: detail.email,
          age: "",
          course: "",
          specialty: detail.specialty,
          hasRoleExaminer: detail.hasRoleExaminer,
          hasRoleSubjectLeader: detail.hasRoleSubjectLeader,
          subjects: detail.subjects_ids ?? [],
        });
        setSubjectSelectKey((prev) => prev + 1);
      } else {
        const detail = await fetchAdminDetail(userId);
        setEditForm({
          name: detail.name,
          email: detail.email,
          age: "",
          course: "",
          specialty: "",
          hasRoleExaminer: false,
          hasRoleSubjectLeader: false,
          subjects: [],
        });
      }
    } catch {
      closeDialogs();
    } finally {
      setIsLoadingUserDetail(false);
    }
  };

  const openEditDialog = (user: DisplayUser) => {
    const roleForEdit: RoleFilter = userRoleFilter === "all" ? "all" : userRoleFilter;
    setSelectedRoleForEdit(roleForEdit);
    setSelectedUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    if (roleForEdit === "student" && "age" in user) {
      setEditForm({
        name: user.name,
        email: user.email,
        age: String(user.age),
        course: String(user.course),
        specialty: "",
        hasRoleExaminer: false,
        hasRoleSubjectLeader: false,
        subjects: [],
      });
    } else if (roleForEdit === "teacher" && "specialty" in user) {
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
      setSubjectSelectKey((prev) => prev + 1);
    } else {
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
    }
    setIsDeleteDialogOpen(false);
    setIsEditDialogOpen(true);
    void loadUserDetails(roleForEdit, user.id);
  };

  const closeDialogs = () => {
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
    setIsLoadingUserDetail(false);
    setEditForm(createEmptyEditForm());
    setSelectedRoleForEdit("all");
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || isLoadingUserDetail) return;
    setIsUpdatingUser(true);
    try {
      if (selectedRoleForEdit === "student") {
        const payload: UpdateStudentPayload = {
          name: editForm.name,
          email: editForm.email,
          age: editForm.age ? Number(editForm.age) : undefined,
          course: editForm.course ? Number(editForm.course) : undefined,
        };
        await onUpdateStudent(selectedUser.id, payload);
      } else if (selectedRoleForEdit === "teacher") {
        let payload: UpdateTeacherPayload = {
          name: editForm.name,
          email: editForm.email,
          specialty: editForm.specialty,
          hasRoleExaminer: editForm.hasRoleExaminer,
          hasRoleSubjectLeader: editForm.hasRoleSubjectLeader,
        };
        if (editForm.hasRoleSubjectLeader && editForm.subjects.length > 0) {
          payload = { ...payload, subjects_ids: editForm.subjects };
        }
        await onUpdateTeacher(selectedUser.id, payload);
      } else {
        const payload: UpdateAdminPayload = {
          name: editForm.name,
          email: editForm.email,
        };
        await onUpdateAdmin(selectedUser.id, payload);
      }
      closeDialogs();
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsDeletingUser(true);
    try {
      if (selectedRoleForEdit === "student") {
        await onDeleteStudent(selectedUser.id);
      } else if (selectedRoleForEdit === "teacher") {
        await onDeleteTeacher(selectedUser.id);
      } else {
        await onDeleteAdmin(selectedUser.id);
      }
      closeDialogs();
    } finally {
      setIsDeletingUser(false);
    }
  };

  const addSubjectToTeacher = (subjectId: string) => {
    if (!subjectId || subjectId === "sin-opciones") return;
    let didAdd = false;
    setEditForm((prev) => {
      if (prev.subjects.includes(subjectId)) {
        return prev;
      }
      didAdd = true;
      return {
        ...prev,
        hasRoleSubjectLeader: true,
        subjects: [...prev.subjects, subjectId],
      };
    });
    if (didAdd) {
      setSubjectSelectKey((prev) => prev + 1);
    }
  };

  const removeSubjectFromTeacher = (subjectId: string) => {
    let didRemove = false;
    setEditForm((prev) => {
      if (!prev.subjects.includes(subjectId)) {
        return prev;
      }
      didRemove = true;
      const updatedSubjects = prev.subjects.filter((id) => id !== subjectId);
      return {
        ...prev,
        subjects: updatedSubjects,
        hasRoleSubjectLeader: updatedSubjects.length > 0 ? prev.hasRoleSubjectLeader : false,
      };
    });
    if (didRemove) {
      setSubjectSelectKey((prev) => prev + 1);
    }
  };

  const renderUserExtraInfo = (user: DisplayUser) => {
    if (userRoleFilter === "student" && "age" in user && "course" in user) {
      return (
        <p className="text-xs text-muted-foreground mt-1">
          {user.age} años • {user.course}
        </p>
      );
    }
    if (userRoleFilter === "teacher" && "specialty" in user) {
      return (
        <p className="text-xs text-muted-foreground mt-1">
          {user.specialty}
        </p>
      );
    }
    return null;
  };

  const renderEditFields = () => {
    if (!selectedUser) {
      return (
        <p className="text-sm text-muted-foreground">
          Selecciona un usuario para editar sus datos.
        </p>
      );
    }

    if (isLoadingUserDetail) {
      return <p className="text-sm text-muted-foreground">Cargando información del usuario...</p>;
    }

    const isStudentMode = selectedRoleForEdit === "student";
    const isTeacherMode = selectedRoleForEdit === "teacher";
    const availableSubjects = subjects.filter((subject) => !editForm.subjects.includes(subject.id));

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

        {isStudentMode && (
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

        {isTeacherMode && (
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
                      setSubjectSelectKey((prev) => prev + 1);
                    }}
                  />
                  <label htmlFor="edit-role-leader" className="text-sm">
                    Jefe de Asignatura
                  </label>
                </div>
              </div>
            </div>
            {editForm.hasRoleSubjectLeader && (
              <div className="space-y-3">
                <Label>Asignaturas a cargo</Label>
                {editForm.subjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Este profesor aún no tiene asignaturas asignadas.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {editForm.subjects.map((subjectId) => {
                      const subject = subjects.find((subject) => subject.id === subjectId);
                      return (
                        <div
                          key={subjectId}
                          className="flex items-center justify-between rounded-md border px-3 py-2"
                        >
                          <span className="text-sm">{subject?.name ?? "Asignatura desconocida"}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSubjectFromTeacher(subjectId)}
                            aria-label={`Eliminar ${subject?.name ?? "asignatura"}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Select
                  key={subjectSelectKey}
                  onValueChange={(value) => addSubjectToTeacher(value)}
                >
                  <SelectTrigger
                    className="flex items-center gap-2"
                    disabled={availableSubjects.length === 0}
                  >
                    <Plus className="h-4 w-4" />
                    <SelectValue
                      placeholder={
                        availableSubjects.length === 0 ? "Sin asignaturas disponibles" : "Añadir asignatura"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.length === 0 ? (
                      <SelectItem value="sin-opciones" disabled>
                        No hay asignaturas disponibles
                      </SelectItem>
                    ) : (
                      availableSubjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
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
        <div className="mb-4 flex flex-col gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre..."
              className="pl-10"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  currentList.setFilter(searchValue.trim());
                }
              }}
            />
          </div>
          <div className="flex w-full items-center gap-3">
            <div className="flex-1">
              <Select
                value={userRoleFilter}
                onValueChange={(value) => handleRoleChange(value as RoleFilter)}
              >
                <SelectTrigger className="w-full">
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
            <Button variant="outline" size="sm" className="shrink-0" onClick={refreshCurrentRole} disabled={isRefreshing}>
              {isRefreshing ? "Actualizando..." : "Refrescar"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {currentError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              Error al cargar {currentFilterLabel.toLowerCase()}: {currentError.message}
            </div>
          )}
          {currentLoading ? (
            <div className="p-4 text-sm text-muted-foreground border rounded-lg text-center">
              Cargando {currentFilterLabel.toLowerCase()}...
            </div>
          ) : currentUsers.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground border rounded-lg text-center">
              No hay {currentFilterLabel.toLowerCase()} para mostrar.
            </div>
          ) : (
            currentUsers.map((user) => (
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
            ))
          )}
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {currentUsers.length} de {totalItems} {currentFilterLabel.toLowerCase()}.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(currentPage - 1)}
              disabled={currentLoading || currentPage <= 1}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(currentPage + 1)}
              disabled={currentLoading || currentPage >= totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Card>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialogs();
          } else {
            setIsEditDialogOpen(true);
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
            <Button variant="outline" onClick={closeDialogs}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateUser}
              disabled={
                isLoadingUserDetail ||
                isUpdatingUser ||
                (selectedRoleForEdit === "teacher" &&
                  editForm.hasRoleSubjectLeader &&
                  editForm.subjects.length === 0)
              }
            >
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
