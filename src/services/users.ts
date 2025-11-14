import type {
  AdminDetail,
  AdminUser,
  CreateAdminPayload,
  CreateStudentPayload,
  CreateTeacherPayload,
  StudentDetail,
  StudentUser,
  TeacherDetail,
  TeacherUser,
  UpdateAdminPayload,
  UpdateStudentPayload,
  UpdateTeacherPayload,
} from "@/types/users";
import type { BaseResponse, RetrieveManySchema, RetrieveOneSchema } from "@/types/backend-responses";
import { backendRequest } from "@/services/api-client";
// Para llamadas autenticadas desde el cliente, usamos un proxy server-side
// que inyecta el encabezado Authorization desde la cookie httpOnly.
const ADMIN_ENDPOINT = "/api/proxy/users";
const STUDENT_ENDPOINT = "/api/proxy/student";
const TEACHER_ENDPOINT = "/api/proxy/teacher";

const USE_MOCK_USERS = process.env.NEXT_PUBLIC_USE_MOCK_USERS === "true";

const toAdminUser = (admin: AdminDetail): AdminUser => ({
  ...admin,
  role: "admin",
});

const toStudentUser = (student: StudentDetail): StudentUser => ({
  ...student,
  role: "student",
});

const toTeacherUser = (teacher: TeacherDetail): TeacherUser => ({
  ...teacher,
  role: "teacher",
});

// Mock Data
const randomId = () => Math.random().toString(36).slice(2);

let mockAdmins: AdminUser[] = [
  { id: "admin-1", name: "Ana Administradora", email: "ana.admin@example.com", role: "admin" },
];

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

// Fetchers

export const fetchAdmins = async (): Promise<AdminUser[]> => {
  if (USE_MOCK_USERS) {
    return mockAdmins;
  }
  //TODO: CAMBIAR LOS RETRIEVE MANY SCHEMA POR PAGINATION SCHEMA
  const resp = await backendRequest<RetrieveManySchema<AdminDetail>>(`${ADMIN_ENDPOINT}?role=admin`);
  const list = resp.data;
  return list.map(toAdminUser);
};

export const fetchStudents = async (): Promise<StudentUser[]> => {
  if (USE_MOCK_USERS) {
    return mockStudents;
  }
  const resp = await backendRequest<RetrieveManySchema<StudentDetail>>(STUDENT_ENDPOINT);
  const list = resp.data;
  return list.map(toStudentUser);
};

export const fetchTeachers = async (): Promise<TeacherUser[]> => {
  if (USE_MOCK_USERS) {
    return mockTeachers;
  }
  const resp = await backendRequest<RetrieveManySchema<TeacherDetail>>(TEACHER_ENDPOINT);
  const list = resp.data;
  return list.map(toTeacherUser);
};

// Creators

export const createAdmin = async (payload: CreateAdminPayload): Promise<AdminUser> => {
  if (USE_MOCK_USERS) {
    const newAdmin: AdminUser = { id: randomId(), name: payload.name, email: payload.email, role: "admin" };
    mockAdmins = [...mockAdmins, newAdmin];
    return newAdmin;
  }
  // El backend espera un campo role para asignar permisos
  const createdResp = await backendRequest<RetrieveOneSchema<AdminDetail>>(ADMIN_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({ ...payload, role: "admin" }),
  });
  const created = createdResp.data;
  if (!created) {
    throw new Error("El backend no devolvió el administrador creado");
  }
  return toAdminUser(created);
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
  const createdResp = await backendRequest<RetrieveOneSchema<StudentDetail>>(STUDENT_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const created = createdResp.data;
  if (!created) {
    throw new Error("El backend no devolvió el estudiante creado");
  }
  return toStudentUser(created);
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
  // El backend puede requerir rol "teacher" en la creación
  const createdResp = await backendRequest<RetrieveOneSchema<TeacherDetail>>(TEACHER_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({ ...payload, role: "teacher" }),
  });
  const created = createdResp.data;
  if (!created) {
    throw new Error("El backend no devolvió el profesor creado");
  }
  return toTeacherUser(created);
};

// Updaters

export const updateAdmin = async (adminId: string, payload: UpdateAdminPayload): Promise<AdminUser> => {
  if (USE_MOCK_USERS) {
    mockAdmins = mockAdmins.map((admin) =>
      admin.id === adminId ? { ...admin, ...payload } : admin
    );
    const updated = mockAdmins.find((admin) => admin.id === adminId);
    if (!updated) throw new Error("Administrador no encontrado");
    return updated;
  }
  const updatedResp = await backendRequest<RetrieveOneSchema<AdminDetail>>(`${ADMIN_ENDPOINT}/${adminId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  const updated = updatedResp.data;
  if (!updated) {
    throw new Error("El backend no devolvió el administrador actualizado");
  }
  return toAdminUser(updated);
};

export const updateStudent = async (studentId: string, payload: UpdateStudentPayload): Promise<StudentUser> => {
  if (USE_MOCK_USERS) {
    mockStudents = mockStudents.map((student) =>
      student.id === studentId ? { ...student, ...payload } : student
    );
    const updated = mockStudents.find((student) => student.id === studentId);
    if (!updated) throw new Error("Estudiante no encontrado");
    return updated;
  }
  const updatedResp = await backendRequest<RetrieveOneSchema<StudentDetail>>(`${STUDENT_ENDPOINT}/${studentId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  const updated = updatedResp.data;
  if (!updated) {
    throw new Error("El backend no devolvió el estudiante actualizado");
  }
  return toStudentUser(updated);
};

export const updateTeacher = async (teacherId: string, payload: UpdateTeacherPayload): Promise<TeacherUser> => {
  if (USE_MOCK_USERS) {
    mockTeachers = mockTeachers.map((teacher) =>
      teacher.id === teacherId ? { ...teacher, ...payload } : teacher
    );
    const updated = mockTeachers.find((teacher) => teacher.id === teacherId);
    if (!updated) throw new Error("Profesor no encontrado");
    return updated;
  }
  const updatedResp = await backendRequest<RetrieveOneSchema<TeacherDetail>>(`${TEACHER_ENDPOINT}/${teacherId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  const updated = updatedResp.data;
  if (!updated) {
    throw new Error("El backend no devolvió el profesor actualizado");
  }
  return toTeacherUser(updated);
};

// Deleters

export const deleteAdmin = async (adminId: string): Promise<void> => {
  if (USE_MOCK_USERS) {
    mockAdmins = mockAdmins.filter((admin) => admin.id !== adminId);
    return;
  }
  await backendRequest<BaseResponse>(`${ADMIN_ENDPOINT}/${adminId}`, { method: "DELETE" });
};

export const deleteStudent = async (studentId: string): Promise<void> => {
  if (USE_MOCK_USERS) {
    mockStudents = mockStudents.filter((student) => student.id !== studentId);
    return;
  }
  await backendRequest<BaseResponse>(`${STUDENT_ENDPOINT}/${studentId}`, { method: "DELETE" });
};

export const deleteTeacher = async (teacherId: string): Promise<void> => {
  if (USE_MOCK_USERS) {
    mockTeachers = mockTeachers.filter((teacher) => teacher.id !== teacherId);
    return;
  }
  await backendRequest<BaseResponse>(`${TEACHER_ENDPOINT}/${teacherId}`, { method: "DELETE" });
};
