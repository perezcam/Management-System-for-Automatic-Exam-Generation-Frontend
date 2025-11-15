import type {
  StudentDetail,
  StudentUser,
  CreateStudentPayload,
  UpdateStudentPayload,
} from "@/types/users";
import {
  STUDENT_ENDPOINT,
  USE_MOCK_USERS,
  randomId,
  request,
  unwrap,
} from "./common";

// Mock específico de students
let mockStudents: StudentUser[] = [
  {
    id: "student-1",
    userId: "user-student-1",
    name: "Carlos Estudiante",
    email: "carlos.student@example.com",
    age: 21,
    course: 3,
    role: "student",
  },
];

const toStudentUser = (student: StudentDetail): StudentUser => ({
  ...student,
  role: "student",
});

// -------- Fetchers --------

export const fetchStudents = async (): Promise<StudentUser[]> => {
  if (USE_MOCK_USERS) {
    return mockStudents;
  }

  const resp = await request<{ data: StudentDetail[] }>(STUDENT_ENDPOINT);
  const list = resp.data;
  return list.map(toStudentUser);
};

// -------- Creators --------

export const createStudent = async (
  payload: CreateStudentPayload
): Promise<StudentUser> => {
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

  const createdResp = await request<StudentDetail | { data: StudentDetail }>(
    STUDENT_ENDPOINT,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  const created = unwrap<StudentDetail>(createdResp);
  return toStudentUser(created);
};

// -------- Updaters --------

export const updateStudent = async (
  studentId: string,
  payload: UpdateStudentPayload
): Promise<StudentUser> => {
  if (USE_MOCK_USERS) {
    mockStudents = mockStudents.map((student) =>
      student.id === studentId ? { ...student, ...payload } : student
    );
    const updated = mockStudents.find((student) => student.id === studentId);
    if (!updated) throw new Error("Estudiante no encontrado");
    return updated;
  }

  const updatedResp = await request<StudentDetail | { data: StudentDetail }>(
    `${STUDENT_ENDPOINT}/${studentId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
  const updated = unwrap<StudentDetail>(updatedResp);
  return toStudentUser(updated);
};

// -------- Deleters --------

export const deleteStudent = async (studentId: string): Promise<void> => {
  if (USE_MOCK_USERS) {
    mockStudents = mockStudents.filter((student) => student.id !== studentId);
    return;
  }

  await request<void>(`${STUDENT_ENDPOINT}/${studentId}`, {
    method: "DELETE",
  });
};
