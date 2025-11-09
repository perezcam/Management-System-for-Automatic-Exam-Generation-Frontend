import { get_teacher_url } from "@/config/backend";
import type {
  CreateTeacherPayload,
  TeacherDetail,
  TeacherUser,
  UpdateTeacherPayload,
} from "@/types/user/teacher";

const TEACHER_ENDPOINT = get_teacher_url();
const USE_MOCK_USERS = process.env.NEXT_PUBLIC_USE_MOCK_USERS === "true";

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

const extractErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    return data?.message ?? `Error ${response.status}`;
  } catch {
    return response.statusText || "Error de red";
  }
};

const randomId = () => Math.random().toString(36).slice(2);

let mockTeachers: TeacherUser[] = [
  {
    id: "teacher-1",
    userId: "user-teacher-1",
    name: "Patricia Profesora",
    email: "patricia.teacher@example.com",
    specialty: "Matemáticas",
    hasRoleExaminer: true,
    hasRoleSubjectLeader: true,
    subjects_ids: ["MAT101"],
    subjects_names: ["Matemáticas I"],
    role: "teacher",
  },
];

export const fetchTeachers = async (): Promise<TeacherUser[]> => {
  if (USE_MOCK_USERS) {
    return mockTeachers;
  }
  const data = await request<TeacherDetail[]>(TEACHER_ENDPOINT);
  return data.map((teacher) => ({ ...teacher, role: "teacher" }));
};

export const createTeacher = async (payload: CreateTeacherPayload): Promise<TeacherUser> => {
  if (USE_MOCK_USERS) {
    const newTeacher: TeacherUser = {
      id: randomId(),
      userId: randomId(),
      name: payload.name,
      email: payload.email,
      specialty: payload.specialty,
      hasRoleExaminer: payload.hasRoleExaminer,
      hasRoleSubjectLeader: payload.hasRoleSubjectLeader,
      subjects_ids: payload.subjects_ids,
      subjects_names: payload.subjects_ids,
      role: "teacher",
    };
    mockTeachers = [...mockTeachers, newTeacher];
    return newTeacher;
  }
  const created = await request<TeacherDetail>(TEACHER_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { ...created, role: "teacher" };
};

export const updateTeacher = async (teacherId: string, payload: UpdateTeacherPayload): Promise<TeacherUser> => {
  if (USE_MOCK_USERS) {
    mockTeachers = mockTeachers.map((teacher) => (teacher.id === teacherId ? { ...teacher, ...payload } : teacher));
    const updated = mockTeachers.find((teacher) => teacher.id === teacherId);
    if (!updated) throw new Error("Profesor no encontrado");
    return updated;
  }
  const updated = await request<TeacherDetail>(`${TEACHER_ENDPOINT}/${teacherId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return { ...updated, role: "teacher" };
};

export const deleteTeacher = async (teacherId: string): Promise<void> => {
  if (USE_MOCK_USERS) {
    mockTeachers = mockTeachers.filter((teacher) => teacher.id !== teacherId);
    return;
  }
  await request<void>(`${TEACHER_ENDPOINT}/${teacherId}`, { method: "DELETE" });
};
