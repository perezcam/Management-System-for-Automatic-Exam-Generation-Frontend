const BACKEND_PATHS = {
  auth: {
    login: "/login",
  },
  users: {
    // Según OpenAPI: /users, /student, /teacher
    admins: "/users",
    students: "/student",
    teachers: "/teacher",
  },
  questionAdministration: {
    questionTypes: "/api/question-bank/question-types",
    subjects: "/api/question-bank/subjects",
    topics: "/api/question-bank/topics",
    subtopics: "/api/question-bank/subtopics",
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
export const get_question_types_url = () => buildUrl(BACKEND_PATHS.questionAdministration.questionTypes);
export const get_question_subjects_url = () => buildUrl(BACKEND_PATHS.questionAdministration.subjects);
export const get_question_topics_url = () => buildUrl(BACKEND_PATHS.questionAdministration.topics);
export const get_question_subtopics_url = () => buildUrl(BACKEND_PATHS.questionAdministration.subtopics);
