export type UserRole = "admin" | "student" | "teacher"; 

//Pagination
export type PaginationParams = {
  limit?: number;
  offset?: number;
};

export type PaginationMeta = {
  limit: number;
  offset: number;
  total: number;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: PaginationMeta;
};



export type AdminDetail = {
  id: string;
  name: string;
  email: string;
};

export type StudentDetail = {
  userId: string;
  id: string;
  name: string;
  email: string;
  age: number;
  course: number;
};

export type TeacherDetail = {
  userId: string;
  id: string;
  name: string;
  email: string;
  specialty: string;
  hasRoleExaminer: boolean;
  hasRoleSubjectLeader: boolean;
  subjects_names?: string[];
  subjects_ids?: string[];
};

export type AdminUser = AdminDetail & { role: "admin" };
export type StudentUser = StudentDetail & { role: "student" };
export type TeacherUser = TeacherDetail & { role: "teacher" };

export type UserRecord = AdminUser | StudentUser | TeacherUser;

// Create schemas
export type CreateAdminPayload = {
  name: string;
  email: string;
  password: string;
};

export type CreateStudentPayload = {
  name: string;
  email: string;
  password: string;
  age: number;
  course: number;
};

export type CreateTeacherPayload = {
  name: string;
  email: string;
  password: string;
  specialty: string;
  hasRoleExaminer: boolean;
  hasRoleSubjectLeader: boolean;
  subjects_ids?: string[];
};

// Update schemas
export type UpdateAdminPayload = Partial<Omit<CreateAdminPayload, "password">>;
export type UpdateStudentPayload = Partial<Omit<CreateStudentPayload, "password">>;
export type UpdateTeacherPayload = Partial<Omit<CreateTeacherPayload, "password">>;
