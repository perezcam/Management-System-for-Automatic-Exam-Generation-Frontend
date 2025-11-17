import { AdminUser } from "./admin";
import { StudentUser } from "./student";
import { TeacherUser } from "./teacher";

// Read schemas
export type UserRole = "admin" | "student" | "teacher"; 



export type UserRecord = AdminUser | StudentUser | TeacherUser;

export type UserSummary = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

