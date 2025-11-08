const BACKEND_PATHS = {
  auth: {
    login: "/api/user/login",
  },
  users: {
    admins: "/api/user",
    students: "/api/student",
    teachers: "/api/teacher",
  },
} as const;

const normalizePath = (path: string) => (path.startsWith("/") ? path : `/${path}`);

const buildUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_BACKEND_URL no está configurada");
  return `${baseUrl}${normalizePath(path)}`;
};

export const get_login_url = () => buildUrl(BACKEND_PATHS.auth.login);
export const get_admin_url = () => buildUrl(BACKEND_PATHS.users.admins);
export const get_student_url = () => buildUrl(BACKEND_PATHS.users.students);
export const get_teacher_url = () => buildUrl(BACKEND_PATHS.users.teachers);
