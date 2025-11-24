import type { AdminUser as AdminUserType } from "./admin";
import type { StudentUser as StudentUserType } from "./student";
import type { TeacherUser as TeacherUserType } from "./teacher";

// Read schemas
export type UserRole = "admin" | "student" | "teacher";

export type User = AdminUserType | StudentUserType | TeacherUserType;
export type UserRecord = User;

export type UserSummary = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type CurrentUser = UserSummary;
