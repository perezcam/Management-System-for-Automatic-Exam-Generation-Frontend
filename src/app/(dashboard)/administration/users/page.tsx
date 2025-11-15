"use client";

import { useRouter } from "next/navigation";
import { UserList } from "@/components/dashboard/administration/users/user-list";
import { UserRegistrationForm } from "@/components/dashboard/administration/users/user-registration-form";
import { useUsers } from "@/hooks/users/use-users";
import { UseQuestionAdministration } from "@/hooks/questions/use-question-administration";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UsersAdminPage() {
  const router = useRouter();
  const {
    users,
    loading: usersLoading,
    error: usersError,
    refresh: refreshUsers,
    createAdmin,
    createStudent,
    createTeacher,
    updateAdmin,
    updateStudent,
    updateTeacher,
    deleteAdmin,
    deleteStudent,
    deleteTeacher,

    page,
    totalPages,
    setPage,
  } = useUsers();

  const { subjects } = UseQuestionAdministration();

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">Gestión de Usuarios</h2>
          <Button variant="ghost" onClick={() => router.push("/administration")}>
            Volver
          </Button>
        </div>

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
                users={users} 
                subjects={subjects.map((s) => ({ id: s.subject_id, name: s.subject_name }))}
                onUpdateAdmin={updateAdmin}
                onUpdateStudent={updateStudent}
                onUpdateTeacher={updateTeacher}
                onDeleteAdmin={deleteAdmin}
                onDeleteStudent={deleteStudent}
                onDeleteTeacher={deleteTeacher}
                page={page}
                totalPages={totalPages}
                onNextPage={handleNextPage}
                onPrevPage={handlePrevPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
