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
import { get_admin_url, get_student_url, get_teacher_url } from "@/config/backend";

const ADMIN_ENDPOINT = get_admin_url();
const STUDENT_ENDPOINT = get_student_url();
const TEACHER_ENDPOINT = get_teacher_url();

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
    course: "3er Año",
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
  const data = await request<AdminDetail[]>(ADMIN_ENDPOINT);
  return data.map(toAdminUser);
};

export const fetchStudents = async (): Promise<StudentUser[]> => {
  if (USE_MOCK_USERS) {
    return mockStudents;
  }
  const data = await request<StudentDetail[]>(STUDENT_ENDPOINT);
  return data.map(toStudentUser);
};

export const fetchTeachers = async (): Promise<TeacherUser[]> => {
  if (USE_MOCK_USERS) {
    return mockTeachers;
  }
  const data = await request<TeacherDetail[]>(TEACHER_ENDPOINT);
  return data.map(toTeacherUser);
};

// Creators

export const createAdmin = async (payload: CreateAdminPayload): Promise<AdminUser> => {
  if (USE_MOCK_USERS) {
    const newAdmin: AdminUser = { id: randomId(), name: payload.name, email: payload.email, role: "admin" };
    mockAdmins = [...mockAdmins, newAdmin];
    return newAdmin;
  }
  const created = await request<AdminDetail>(ADMIN_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
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
  const created = await request<StudentDetail>(STUDENT_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
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
  const created = await request<TeacherDetail>(TEACHER_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
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
  const updated = await request<AdminDetail>(`${ADMIN_ENDPOINT}/${adminId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
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
  const updated = await request<StudentDetail>(`${STUDENT_ENDPOINT}/${studentId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
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
  const updated = await request<TeacherDetail>(`${TEACHER_ENDPOINT}/${teacherId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return toTeacherUser(updated);
};

// Deleters

export const deleteAdmin = async (adminId: string): Promise<void> => {
  if (USE_MOCK_USERS) {
    mockAdmins = mockAdmins.filter((admin) => admin.id !== adminId);
    return;
  }
  await request<void>(`${ADMIN_ENDPOINT}/${adminId}`, { method: "DELETE" });
};

export const deleteStudent = async (studentId: string): Promise<void> => {
  if (USE_MOCK_USERS) {
    mockStudents = mockStudents.filter((student) => student.id !== studentId);
    return;
  }
  await request<void>(`${STUDENT_ENDPOINT}/${studentId}`, { method: "DELETE" });
};

export const deleteTeacher = async (teacherId: string): Promise<void> => {
  if (USE_MOCK_USERS) {
    mockTeachers = mockTeachers.filter((teacher) => teacher.id !== teacherId);
    return;
  }
  await request<void>(`${TEACHER_ENDPOINT}/${teacherId}`, { method: "DELETE" });
};
