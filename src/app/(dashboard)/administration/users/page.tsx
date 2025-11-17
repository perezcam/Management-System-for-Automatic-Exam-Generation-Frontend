"use client";

import { useRouter } from "next/navigation";
import { UserList } from "@/components/dashboard/administration/users/user-list";
import { UserRegistrationForm } from "@/components/dashboard/administration/users/user-registration-form";
import { useUsers } from "@/hooks/users/use-users";
import { UseQuestionAdministration} from "@/hooks/questions/use-question-administration";
import { Card } from "@/components/ui/card";
import { UserManagementHeader } from "@/components/dashboard/administration/users/user-management-header";
import { Button } from "@/components/ui/button";

export default function UsersAdminPage() {
  const router = useRouter();
  const {
    users,
    usersMeta,
    usersPage,
    usersPageSize,
    usersFilter,
    loading: usersLoading,
    error: usersError,
    refresh: refreshUsers,
    setUsersPage,
    setUsersFilter,
    admins,
    adminsMeta,
    adminsPage,
    adminsPageSize,
    adminsFilter,
    adminsLoading,
    adminsError,
    refreshAdmins,
    setAdminsPage,
    setAdminsFilter,
    students,
    studentsMeta,
    studentsPage,
    studentsPageSize,
    studentsFilter,
    studentsLoading,
    studentsError,
    refreshStudents,
    setStudentsPage,
    setStudentsFilter,
    teachers,
    teachersMeta,
    teachersPage,
    teachersPageSize,
    teachersFilter,
    teachersLoading,
    teachersError,
    refreshTeachers,
    setTeachersPage,
    setTeachersFilter,
    createAdmin, createStudent, createTeacher,
    updateAdmin, updateStudent, updateTeacher,
    deleteAdmin, deleteStudent, deleteTeacher,
  } = useUsers();

  const { subjects } = UseQuestionAdministration();

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <UserManagementHeader onBack={() => router.push("/administration")} />

        {usersError && (
          <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <div className="flex items-center justify-between gap-4">
              <span>Error al cargar usuarios: {usersError.message}</span>
              <Button variant="outline" size="sm" onClick={refreshUsers}>
                Reintentar
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <UserRegistrationForm
              subjects={subjects.map((s) => ({ id: s.subject_id, name: s.subject_name }))}
              onCreateAdmin={createAdmin}
              onCreateStudent={createStudent}
              onCreateTeacher={createTeacher}
            />
          </div>

          <div className="lg:col-span-2">
            {usersLoading ? (
              <Card className="p-6 flex items-center justify-center text-sm text-muted-foreground h-full">
                Cargando usuarios...
              </Card>
            ) : (
              <UserList
                all={{
                  data: users,
                  meta: usersMeta,
                  page: usersPage,
                  pageSize: usersPageSize,
                  filter: usersFilter,
                  loading: usersLoading,
                  error: usersError,
                  setPage: setUsersPage,
                  refresh: refreshUsers,
                  setFilter: setUsersFilter,
                }}
                admins={{
                  data: admins,
                  meta: adminsMeta,
                  page: adminsPage,
                  pageSize: adminsPageSize,
                  filter: adminsFilter,
                  loading: adminsLoading,
                  error: adminsError,
                  setPage: setAdminsPage,
                  refresh: refreshAdmins,
                  setFilter: setAdminsFilter,
                }}
                students={{
                  data: students,
                  meta: studentsMeta,
                  page: studentsPage,
                  pageSize: studentsPageSize,
                  filter: studentsFilter,
                  loading: studentsLoading,
                  error: studentsError,
                  setPage: setStudentsPage,
                  refresh: refreshStudents,
                  setFilter: setStudentsFilter,
                }}
                teachers={{
                  data: teachers,
                  meta: teachersMeta,
                  page: teachersPage,
                  pageSize: teachersPageSize,
                  filter: teachersFilter,
                  loading: teachersLoading,
                  error: teachersError,
                  setPage: setTeachersPage,
                  refresh: refreshTeachers,
                  setFilter: setTeachersFilter,
                }}
                subjects={subjects.map((s) => ({ id: s.subject_id, name: s.subject_name }))}
                onUpdateAdmin={updateAdmin}
                onUpdateStudent={updateStudent}
                onUpdateTeacher={updateTeacher}
                onDeleteAdmin={deleteAdmin}
                onDeleteStudent={deleteStudent}
                onDeleteTeacher={deleteTeacher}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
