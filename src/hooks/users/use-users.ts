"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AdminUser,
  CreateAdminPayload,
  CreateStudentPayload,
  CreateTeacherPayload,
  StudentUser,
  TeacherUser,
  UpdateAdminPayload,
  UpdateStudentPayload,
  UpdateTeacherPayload,
  UserSummary,
} from "@/types/users";
import type { PaginationMeta } from "@/types/backend-responses";
import { fetchUsers } from "@/services/users";
import { useAdmins } from "./use-admins";
import { useStudents } from "./use-students";
import { useTeachers } from "./use-teachers";

const SUMMARY_PAGE_SIZE = 10;

export type UseUsersResult = {
  users: UserSummary[];
  usersMeta: PaginationMeta | null;
  usersPage: number;
  usersPageSize: number;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setUsersPage: (page: number) => void;
  admins: AdminUser[];
  adminsMeta: PaginationMeta | null;
  adminsPage: number;
  adminsPageSize: number;
  adminsLoading: boolean;
  adminsError: Error | null;
  refreshAdmins: () => Promise<void>;
  setAdminsPage: (page: number) => void;
  students: StudentUser[];
  studentsMeta: PaginationMeta | null;
  studentsPage: number;
  studentsPageSize: number;
  studentsLoading: boolean;
  studentsError: Error | null;
  refreshStudents: () => Promise<void>;
  setStudentsPage: (page: number) => void;
  teachers: TeacherUser[];
  teachersMeta: PaginationMeta | null;
  teachersPage: number;
  teachersPageSize: number;
  teachersLoading: boolean;
  teachersError: Error | null;
  refreshTeachers: () => Promise<void>;
  setTeachersPage: (page: number) => void;
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
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [usersMeta, setUsersMeta] = useState<PaginationMeta | null>(null);
  const [usersPage, setUsersPageState] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadUsersPage = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data, meta } = await fetchUsers({
        limit: SUMMARY_PAGE_SIZE,
        offset: (targetPage - 1) * SUMMARY_PAGE_SIZE,
      });
      const total = meta.total;
      const totalPages = total > 0 ? Math.ceil(total / SUMMARY_PAGE_SIZE) : 1;
      if (targetPage > totalPages && totalPages > 0) {
        setUsersPageState(totalPages);
        return;
      }
      setUsers(data);
      setUsersMeta(meta);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsersPage(usersPage);
  }, [loadUsersPage, usersPage]);

  const refreshAll = useCallback(async () => {
    await loadUsersPage(usersPage);
  }, [loadUsersPage, usersPage]);

  const setUsersPage = useCallback((page: number) => {
    setUsersPageState(page < 1 ? 1 : page);
  }, []);

  const {
    admins,
    meta: adminsMeta,
    page: adminsPage,
    pageSize: adminsPageSize,
    loading: adminsLoading,
    error: adminsError,
    refresh: refreshAdmins,
    setPage: setAdminsPage,
    createAdmin: createAdminHook,
    updateAdmin: updateAdminHook,
    deleteAdmin: deleteAdminHook,
  } = useAdmins();

  const {
    students,
    meta: studentsMeta,
    page: studentsPage,
    pageSize: studentsPageSize,
    loading: studentsLoading,
    error: studentsError,
    refresh: refreshStudents,
    setPage: setStudentsPage,
    createStudent: createStudentHook,
    updateStudent: updateStudentHook,
    deleteStudent: deleteStudentHook,
  } = useStudents();

  const {
    teachers,
    meta: teachersMeta,
    page: teachersPage,
    pageSize: teachersPageSize,
    loading: teachersLoading,
    error: teachersError,
    refresh: refreshTeachers,
    setPage: setTeachersPage,
    createTeacher: createTeacherHook,
    updateTeacher: updateTeacherHook,
    deleteTeacher: deleteTeacherHook,
  } = useTeachers();

  const handleCreateAdmin = useCallback(async (payload: CreateAdminPayload) => {
    await createAdminHook(payload);
    await refreshAll();
  }, [createAdminHook, refreshAll]);

  const handleCreateStudent = useCallback(async (payload: CreateStudentPayload) => {
    await createStudentHook(payload);
    await refreshAll();
  }, [createStudentHook, refreshAll]);

  const handleCreateTeacher = useCallback(async (payload: CreateTeacherPayload) => {
    await createTeacherHook(payload);
    await refreshAll();
  }, [createTeacherHook, refreshAll]);

  const handleUpdateAdmin = useCallback(async (adminId: string, payload: UpdateAdminPayload) => {
    await updateAdminHook(adminId, payload);
    await refreshAll();
  }, [refreshAll, updateAdminHook]);

  const handleUpdateStudent = useCallback(async (studentId: string, payload: UpdateStudentPayload) => {
    await updateStudentHook(studentId, payload);
    await refreshAll();
  }, [refreshAll, updateStudentHook]);

  const handleUpdateTeacher = useCallback(async (teacherId: string, payload: UpdateTeacherPayload) => {
    await updateTeacherHook(teacherId, payload);
    await refreshAll();
  }, [refreshAll, updateTeacherHook]);

  const handleDeleteAdmin = useCallback(async (adminId: string) => {
    await deleteAdminHook(adminId);
    await refreshAll();
  }, [deleteAdminHook, refreshAll]);

  const handleDeleteStudent = useCallback(async (studentId: string) => {
    await deleteStudentHook(studentId);
    await refreshAll();
  }, [deleteStudentHook, refreshAll]);

  const handleDeleteTeacher = useCallback(async (teacherId: string) => {
    await deleteTeacherHook(teacherId);
    await refreshAll();
  }, [deleteTeacherHook, refreshAll]);

  return {
    users,
    usersMeta,
    usersPage,
    usersPageSize: SUMMARY_PAGE_SIZE,
    loading,
    error,
    refresh: refreshAll,
    setUsersPage,
    admins,
    adminsMeta,
    adminsPage,
    adminsPageSize,
    adminsLoading,
    adminsError,
    refreshAdmins,
    setAdminsPage,
    students,
    studentsMeta,
    studentsPage,
    studentsPageSize,
    studentsLoading,
    studentsError,
    refreshStudents,
    setStudentsPage,
    teachers,
    teachersMeta,
    teachersPage,
    teachersPageSize,
    teachersLoading,
    teachersError,
    refreshTeachers,
    setTeachersPage,
    createAdmin: handleCreateAdmin,
    createStudent: handleCreateStudent,
    createTeacher: handleCreateTeacher,
    updateAdmin: handleUpdateAdmin,
    updateStudent: handleUpdateStudent,
    updateTeacher: handleUpdateTeacher,
    deleteAdmin: handleDeleteAdmin,
    deleteStudent: handleDeleteStudent,
    deleteTeacher: handleDeleteTeacher,
  };
}
