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

export type TeacherUser = TeacherDetail & { role: "teacher" };

export type CreateTeacherPayload = {
  name: string;
  email: string;
  password: string;
  specialty: string;
  hasRoleExaminer: boolean;
  hasRoleSubjectLeader: boolean;
  subjects_ids?: string[];
};

export type UpdateTeacherPayload = Partial<Omit<CreateTeacherPayload, "password">>;