"use client";

import { useMemo } from "react";
import type {
  AdminUser, StudentUser, TeacherUser, UserRecord,
  CreateAdminPayload, CreateStudentPayload, CreateTeacherPayload,
  UpdateAdminPayload, UpdateStudentPayload, UpdateTeacherPayload,
} from "@/types/users";
import { useAdmins } from "./use-admins";
import { useStudents } from "./use-students";
import { useTeachers } from "./use-teachers";

export type UseUsersResult = {
  admins: AdminUser[];
  students: StudentUser[];
  teachers: TeacherUser[];
  users: UserRecord[];                // unión de los tres
  loading: boolean;                   // OR de los tres
  error: Error | null;                // primera no-nula
  refresh: () => Promise<void>;       // refresca todo
  createAdmin: (payload: CreateAdminPayload) => Promise<void>;
  createStudent: (payload: CreateStudentPayload) => Promise<void>;
  createTeacher: (payload: CreateTeacherPayload) => Promise<void>;
  updateAdmin: (id: string, payload: UpdateAdminPayload) => Promise<void>;
  updateStudent: (id: string, payload: UpdateStudentPayload) => Promise<void>;
  updateTeacher: (id: string, payload: UpdateTeacherPayload) => Promise<void>;
  deleteAdmin: (id: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
};

export function useUsers(): UseUsersResult {
  const A = useAdmins();
  const S = useStudents();
  const T = useTeachers();

  const users = useMemo<UserRecord[]>(
    () => [...A.admins, ...S.students, ...T.teachers],
    [A.admins, S.students, T.teachers]
  );

  const loading = A.loading || S.loading || T.loading;
  const error = A.error ?? S.error ?? T.error;

  const refresh = async () => {
    await Promise.all([A.refresh(), S.refresh(), T.refresh()]);
  };

  return {
    admins: A.admins,
    students: S.students,
    teachers: T.teachers,
    users,
    loading,
    error,
    refresh,
    // Passthrough de acciones por rol
    createAdmin: A.createAdmin,
    createStudent: S.createStudent,
    createTeacher: T.createTeacher,
    updateAdmin: A.updateAdmin,
    updateStudent: S.updateStudent,
    updateTeacher: T.updateTeacher,
    deleteAdmin: A.deleteAdmin,
    deleteStudent: S.deleteStudent,
    deleteTeacher: T.deleteTeacher,
  };
}
