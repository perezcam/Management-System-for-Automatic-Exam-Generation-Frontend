import { useCallback, useEffect, useState } from "react";
import type { CreateStudentPayload, StudentUser, UpdateStudentPayload } from "@/types/user/student";
import {
  createStudent as createStudentService,
  deleteStudent as deleteStudentService,
  fetchStudents,
  updateStudent as updateStudentService,
} from "@/services/administration/users/student";

type UseStudentUsersResult = {
  students: StudentUser[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createStudent: (payload: CreateStudentPayload) => Promise<void>;
  updateStudent: (studentId: string, payload: UpdateStudentPayload) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
};

export const useStudentUsers = (): UseStudentUsersResult => {
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStudents();
      setStudents(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  const handleCreateStudent = useCallback(async (payload: CreateStudentPayload) => {
    const created = await createStudentService(payload);
    setStudents((prev) => [...prev, created]);
  }, []);

  const handleUpdateStudent = useCallback(async (studentId: string, payload: UpdateStudentPayload) => {
    const updated = await updateStudentService(studentId, payload);
    setStudents((prev) => prev.map((student) => (student.id === studentId ? updated : student)));
  }, []);

  const handleDeleteStudent = useCallback(async (studentId: string) => {
    await deleteStudentService(studentId);
    setStudents((prev) => prev.filter((student) => student.id !== studentId));
  }, []);

  return {
    students,
    loading,
    error,
    refresh: loadStudents,
    createStudent: handleCreateStudent,
    updateStudent: handleUpdateStudent,
    deleteStudent: handleDeleteStudent,
  };
};
