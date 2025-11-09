import { get_student_url } from "@/config/backend";
import type {
  CreateStudentPayload,
  StudentDetail,
  StudentUser,
  UpdateStudentPayload,
} from "@/types/user/student";

const STUDENT_ENDPOINT = get_student_url();
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

let mockStudents: StudentUser[] = [
  {
    id: "student-1",
    userId: "user-student-1",
    name: "Carlos Estudiante",
    email: "carlos.student@example.com",
    age: 21,
    course: "3er Año",
    role: "student",
  },
];

export const fetchStudents = async (): Promise<StudentUser[]> => {
  if (USE_MOCK_USERS) {
    return mockStudents;
  }
  const data = await request<StudentDetail[]>(STUDENT_ENDPOINT);
  return data.map((student) => ({ ...student, role: "student" }));
};

export const createStudent = async (payload: CreateStudentPayload): Promise<StudentUser> => {
  if (USE_MOCK_USERS) {
    const newStudent: StudentUser = {
      id: randomId(),
      userId: randomId(),
      name: payload.name,
      email: payload.email,
      age: payload.age,
      course: payload.course,
      role: "student",
    };
    mockStudents = [...mockStudents, newStudent];
    return newStudent;
  }
  const created = await request<StudentDetail>(STUDENT_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { ...created, role: "student" };
};

export const updateStudent = async (studentId: string, payload: UpdateStudentPayload): Promise<StudentUser> => {
  if (USE_MOCK_USERS) {
    mockStudents = mockStudents.map((student) => (student.id === studentId ? { ...student, ...payload } : student));
    const updated = mockStudents.find((student) => student.id === studentId);
    if (!updated) throw new Error("Estudiante no encontrado");
    return updated;
  }
  const updated = await request<StudentDetail>(`${STUDENT_ENDPOINT}/${studentId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return { ...updated, role: "student" };
};

export const deleteStudent = async (studentId: string): Promise<void> => {
  if (USE_MOCK_USERS) {
    mockStudents = mockStudents.filter((student) => student.id !== studentId);
    return;
  }
  await request<void>(`${STUDENT_ENDPOINT}/${studentId}`, { method: "DELETE" });
};
