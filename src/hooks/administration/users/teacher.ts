import { useCallback, useEffect, useState } from "react";
import type { CreateTeacherPayload, TeacherUser, UpdateTeacherPayload } from "@/types/user/teacher";
import {
  createTeacher as createTeacherService,
  deleteTeacher as deleteTeacherService,
  fetchTeachers,
  updateTeacher as updateTeacherService,
} from "@/services/administration/users/teacher";

type UseTeacherUsersResult = {
  teachers: TeacherUser[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createTeacher: (payload: CreateTeacherPayload) => Promise<void>;
  updateTeacher: (teacherId: string, payload: UpdateTeacherPayload) => Promise<void>;
  deleteTeacher: (teacherId: string) => Promise<void>;
};

export const useTeacherUsers = (): UseTeacherUsersResult => {
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTeachers = useCallback(async () => {
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
    void loadTeachers();
  }, [loadTeachers]);

  const handleCreateTeacher = useCallback(async (payload: CreateTeacherPayload) => {
    const created = await createTeacherService(payload);
    setTeachers((prev) => [...prev, created]);
  }, []);

  const handleUpdateTeacher = useCallback(async (teacherId: string, payload: UpdateTeacherPayload) => {
    const updated = await updateTeacherService(teacherId, payload);
    setTeachers((prev) => prev.map((teacher) => (teacher.id === teacherId ? updated : teacher)));
  }, []);

  const handleDeleteTeacher = useCallback(async (teacherId: string) => {
    await deleteTeacherService(teacherId);
    setTeachers((prev) => prev.filter((teacher) => teacher.id !== teacherId));
  }, []);

  return {
    teachers,
    loading,
    error,
    refresh: loadTeachers,
    createTeacher: handleCreateTeacher,
    updateTeacher: handleUpdateTeacher,
    deleteTeacher: handleDeleteTeacher,
  };
};
