import type {
  StudentDetail,
  StudentUser,
  CreateStudentPayload,
  UpdateStudentPayload,
  PaginatedResult,
  PaginationParams
} from "@/types/users";
import {
  STUDENT_ENDPOINT,
  USE_MOCK_USERS,
  DEFAULT_PAGE_SIZE,
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
  {
    id: "student-2",
    userId: "user-student-2",
    name: "Ana Ramirez",
    email: "ana.ramirez@example.com",
    age: 20,
    course: 2,
    role: "student",
  },
  {
    id: "student-3",
    userId: "user-student-3",
    name: "Luis Hernandez",
    email: "luis.hernandez@example.com",
    age: 22,
    course: 4,
    role: "student",
  },
  {
    id: "student-4",
    userId: "user-student-4",
    name: "Maria Lopez",
    email: "maria.lopez@example.com",
    age: 19,
    course: 1,
    role: "student",
  },
  {
    id: "student-5",
    userId: "user-student-5",
    name: "Jorge Castillo",
    email: "jorge.castillo@example.com",
    age: 23,
    course: 5,
    role: "student",
  },
  {
    id: "student-6",
    userId: "user-student-6",
    name: "Sofia Morales",
    email: "sofia.morales@example.com",
    age: 20,
    course: 2,
    role: "student",
  },
  {
    id: "student-7",
    userId: "user-student-7",
    name: "Diego Fernandez",
    email: "diego.fernandez@example.com",
    age: 24,
    course: 6,
    role: "student",
  },
  {
    id: "student-8",
    userId: "user-student-8",
    name: "Valentina Torres",
    email: "valentina.torres@example.com",
    age: 21,
    course: 3,
    role: "student",
  },
  {
    id: "student-9",
    userId: "user-student-9",
    name: "Andres Vargas",
    email: "andres.vargas@example.com",
    age: 22,
    course: 4,
    role: "student",
  },
  {
    id: "student-10",
    userId: "user-student-10",
    name: "Camila Suarez",
    email: "camila.suarez@example.com",
    age: 19,
    course: 1,
    role: "student",
  },
  {
    id: "student-11",
    userId: "user-student-11",
    name: "Tomas Delgado",
    email: "tomas.delgado@example.com",
    age: 23,
    course: 5,
    role: "student",
  },
  {
    id: "student-12",
    userId: "user-student-12",
    name: "Laura Fuentes",
    email: "laura.fuentes@example.com",
    age: 20,
    course: 2,
    role: "student",
  },
  {
    id: "student-13",
    userId: "user-student-13",
    name: "Mateo Rios",
    email: "mateo.rios@example.com",
    age: 21,
    course: 3,
    role: "student",
  },
  {
    id: "student-14",
    userId: "user-student-14",
    name: "Isabella Garza",
    email: "isabella.garza@example.com",
    age: 22,
    course: 4,
    role: "student",
  },
  {
    id: "student-15",
    userId: "user-student-15",
    name: "Sebastian Cortez",
    email: "sebastian.cortez@example.com",
    age: 24,
    course: 6,
    role: "student",
  },
  {
    id: "student-16",
    userId: "user-student-16",
    name: "Paula Nunez",
    email: "paula.nunez@example.com",
    age: 19,
    course: 1,
    role: "student",
  },
  {
    id: "student-17",
    userId: "user-student-17",
    name: "Ricardo Mejia",
    email: "ricardo.mejia@example.com",
    age: 23,
    course: 5,
    role: "student",
  },
  {
    id: "student-18",
    userId: "user-student-18",
    name: "Fernanda Salas",
    email: "fernanda.salas@example.com",
    age: 20,
    course: 2,
    role: "student",
  },
  {
    id: "student-19",
    userId: "user-student-19",
    name: "Ignacio Paredes",
    email: "ignacio.paredes@example.com",
    age: 21,
    course: 3,
    role: "student",
  },
  {
    id: "student-20",
    userId: "user-student-20",
    name: "Daniela Cabrera",
    email: "daniela.cabrera@example.com",
    age: 22,
    course: 4,
    role: "student",
  },
];

const toStudentUser = (student: StudentDetail): StudentUser => ({
  ...student,
  role: "student",
});

// ---- Fetchers ----

export const fetchStudents = async (
  params?: PaginationParams
): Promise<PaginatedResult<StudentUser>> => {
  const { limit = DEFAULT_PAGE_SIZE, offset = 0 } = params ?? {};

  if (USE_MOCK_USERS) {
    const total = mockStudents.length;
    const data = mockStudents.slice(offset, offset + limit);
    return { data, meta: { limit, offset, total } };
  }

  const searchParams = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const resp = await request<PaginatedResult<StudentDetail>>(
    `${STUDENT_ENDPOINT}?${searchParams.toString()}`
  );

  return {
    data: resp.data.map(toStudentUser),
    meta: resp.meta,
  };
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
