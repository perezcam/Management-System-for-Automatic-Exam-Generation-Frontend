"use client";
import { useCallback, useEffect, useState } from "react";
import type { TeacherUser, CreateTeacherPayload, UpdateTeacherPayload } from "@/types/users";
import { fetchTeachers, createTeacher, updateTeacher, deleteTeacher } from "@/services/users/teacher-service";

export type UseTeachersResult = {
  teachers: TeacherUser[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createTeacher: (payload: CreateTeacherPayload) => Promise<void>;
  updateTeacher: (teacherId: string, payload: UpdateTeacherPayload) => Promise<void>;
  deleteTeacher: (teacherId: string) => Promise<void>;
};

export function useTeachers(): UseTeachersResult {
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTeachers();
      setTeachers(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCreate = useCallback(async (payload: CreateTeacherPayload) => {
    const created = await createTeacher(payload);
    setTeachers(prev => [...prev, created]);
  }, []);

  const handleUpdate = useCallback(async (teacherId: string, payload: UpdateTeacherPayload) => {
    const updated = await updateTeacher(teacherId, payload);
    setTeachers(prev => prev.map(t => (t.id === teacherId ? updated : t)));
  }, []);

  const handleDelete = useCallback(async (teacherId: string) => {
    await deleteTeacher(teacherId);
    setTeachers(prev => prev.filter(t => t.id !== teacherId));
  }, []);

  return {
    teachers,
    loading,
    error,
    refresh,
    createTeacher: handleCreate,
    updateTeacher: handleUpdate,
    deleteTeacher: handleDelete,
  };
}
