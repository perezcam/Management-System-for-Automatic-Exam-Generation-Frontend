import { useCallback, useEffect, useMemo, useState } from "react";
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
  UserRecord,
} from "@/types/users";
import {
  createAdmin,
  createStudent,
  createTeacher,
  deleteAdmin,
  deleteStudent,
  deleteTeacher,
  fetchAdmins,
  fetchStudents,
  fetchTeachers,
  updateAdmin,
  updateStudent,
  updateTeacher,
} from "@/services/users";

type UseUsersResult = {
  admins: AdminUser[];
  students: StudentUser[];
  teachers: TeacherUser[];
  users: UserRecord[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createAdmin: (payload: CreateAdminPayload) => Promise<void>;
  createStudent: (payload: CreateStudentPayload) => Promise<void>;
  createTeacher: (payload: CreateTeacherPayload) => Promise<void>;
  updateAdmin: (adminId: string, payload: UpdateAdminPayload) => Promise<void>;
  updateStudent: (studentId: string, payload: UpdateStudentPayload) => Promise<void>;
  updateTeacher: (teacherId: string, payload: UpdateTeacherPayload) => Promise<void>;
  deleteAdmin: (adminId: string) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  deleteTeacher: (teacherId: string) => Promise<void>;
};

export const useUsers = (): UseUsersResult => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [adminsData, studentsData, teachersData] = await Promise.all([
        fetchAdmins(),
        fetchStudents(),
        fetchTeachers(),
      ]);
      setAdmins(adminsData);
      setStudents(studentsData);
      setTeachers(teachersData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const users = useMemo<UserRecord[]>(() => [...admins, ...students, ...teachers], [admins, students, teachers]);

  const handleCreateAdmin = useCallback(async (payload: CreateAdminPayload) => {
    const created = await createAdmin(payload);
    setAdmins((prev) => [...prev, created]);
  }, []);

  const handleCreateStudent = useCallback(async (payload: CreateStudentPayload) => {
    const created = await createStudent(payload);
    setStudents((prev) => [...prev, created]);
  }, []);

  const handleCreateTeacher = useCallback(async (payload: CreateTeacherPayload) => {
    const created = await createTeacher(payload);
    setTeachers((prev) => [...prev, created]);
  }, []);

  const handleUpdateAdmin = useCallback(async (adminId: string, payload: UpdateAdminPayload) => {
    const updated = await updateAdmin(adminId, payload);
    setAdmins((prev) => prev.map((admin) => (admin.id === adminId ? updated : admin)));
  }, []);

  const handleUpdateStudent = useCallback(async (studentId: string, payload: UpdateStudentPayload) => {
    const updated = await updateStudent(studentId, payload);
    setStudents((prev) => prev.map((student) => (student.id === studentId ? updated : student)));
  }, []);

  const handleUpdateTeacher = useCallback(async (teacherId: string, payload: UpdateTeacherPayload) => {
    const updated = await updateTeacher(teacherId, payload);
    setTeachers((prev) => prev.map((teacher) => (teacher.id === teacherId ? updated : teacher)));
  }, []);

  const handleDeleteAdmin = useCallback(async (adminId: string) => {
    await deleteAdmin(adminId);
    setAdmins((prev) => prev.filter((admin) => admin.id !== adminId));
  }, []);

  const handleDeleteStudent = useCallback(async (studentId: string) => {
    await deleteStudent(studentId);
    setStudents((prev) => prev.filter((student) => student.id !== studentId));
  }, []);

  const handleDeleteTeacher = useCallback(async (teacherId: string) => {
    await deleteTeacher(teacherId);
    setTeachers((prev) => prev.filter((teacher) => teacher.id !== teacherId));
  }, []);

  return {
    admins,
    students,
    teachers,
    users,
    loading,
    error,
    refresh: loadUsers,
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
};
