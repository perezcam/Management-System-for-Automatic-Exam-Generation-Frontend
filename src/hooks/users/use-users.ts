"use client";

import { useMemo, useState } from "react";
import type {
  AdminUser,
  StudentUser,
  TeacherUser,
  UserRecord,
  CreateAdminPayload,
  CreateStudentPayload,
  CreateTeacherPayload,
  UpdateAdminPayload,
  UpdateStudentPayload,
  UpdateTeacherPayload,
} from "@/types/users";
import { useAdmins } from "./use-admins";
import { useStudents } from "./use-students";
import { useTeachers } from "./use-teachers";

export type UseUsersResult = {
  admins: AdminUser[];
  students: StudentUser[];
  teachers: TeacherUser[];

  // 🚨 IMPORTANTE: estos `users` ya están paginados
  users: UserRecord[];

  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;

  createAdmin: (payload: CreateAdminPayload) => Promise<void>;
  createStudent: (payload: CreateStudentPayload) => Promise<void>;
  createTeacher: (payload: CreateTeacherPayload) => Promise<void>;
  updateAdmin: (id: string, payload: UpdateAdminPayload) => Promise<void>;
  updateStudent: (id: string, payload: UpdateStudentPayload) => Promise<void>;
  updateTeacher: (id: string, payload: UpdateTeacherPayload) => Promise<void>;
  deleteAdmin: (id: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;

  // datos de paginación del listado global
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  setPage: (page: number) => void;
};

const PAGE_SIZE = 20;

export function useUsers(): UseUsersResult {
  const A = useAdmins();
  const S = useStudents();
  const T = useTeachers();

  // Todos los usuarios cargados (sin paginar)
  const allUsers = useMemo<UserRecord[]>(
    () => [...A.admins, ...S.students, ...T.teachers],
    [A.admins, S.students, T.teachers]
  );

  const [page, setPage] = useState(0);
  const pageSize = PAGE_SIZE;

  const total = allUsers.length;
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;

  // Si borro cosas y la página actual se va “fuera de rango”
  if (page >= totalPages && totalPages > 0 && page !== totalPages - 1) {
    setPage(totalPages - 1);
  }

  const users = useMemo(() => {
    const start = page * pageSize;
    return allUsers.slice(start, start + pageSize);
  }, [allUsers, page, pageSize]);

  const loading = A.loading || S.loading || T.loading;
  const error = A.error ?? S.error ?? T.error;

  const refresh = async () => {
    await Promise.all([A.refresh(), S.refresh(), T.refresh()]);
  };

  return {
    admins: A.admins,
    students: S.students,
    teachers: T.teachers,
    users, // 👈 YA paginados
    loading,
    error,
    refresh,
    createAdmin: A.createAdmin,
    createStudent: S.createStudent,
    createTeacher: T.createTeacher,
    updateAdmin: A.updateAdmin,
    updateStudent: S.updateStudent,
    updateTeacher: T.updateTeacher,
    deleteAdmin: A.deleteAdmin,
    deleteStudent: S.deleteStudent,
    deleteTeacher: T.deleteTeacher,
    page,
    pageSize,
    total,
    totalPages,
    setPage,
  };
}
