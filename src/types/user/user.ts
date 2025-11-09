import { AdminUser } from "./admin";
import { StudentUser } from "./student";
import { TeacherUser } from "./teacher";

export type UserRole = "admin" | "student" | "teacher"; 
export type UserRecord = AdminUser | StudentUser | TeacherUser;


