"use client";
import { useCallback, useEffect, useState } from "react";
import type { StudentUser, CreateStudentPayload, UpdateStudentPayload } from "@/types/users";
import { fetchStudents, createStudent, updateStudent, deleteStudent } from "@/services/users";

export type UseStudentsResult = {
  students: StudentUser[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createStudent: (payload: CreateStudentPayload) => Promise<void>;
  updateStudent: (studentId: string, payload: UpdateStudentPayload) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
};

export function useStudents(): UseStudentsResult {
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
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
    void refresh();
  }, [refresh]);

  const handleCreate = useCallback(async (payload: CreateStudentPayload) => {
    const created = await createStudent(payload);
    setStudents(prev => [...prev, created]);
  }, []);

  const handleUpdate = useCallback(async (studentId: string, payload: UpdateStudentPayload) => {
    const updated = await updateStudent(studentId, payload);
    setStudents(prev => prev.map(s => (s.id === studentId ? updated : s)));
  }, []);

  const handleDelete = useCallback(async (studentId: string) => {
    await deleteStudent(studentId);
    setStudents(prev => prev.filter(s => s.id !== studentId));
  }, []);

  return {
    students,
    loading,
    error,
    refresh,
    createStudent: handleCreate,
    updateStudent: handleUpdate,
    deleteStudent: handleDelete,
  };
}
