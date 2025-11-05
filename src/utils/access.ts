export type Role = "student" | "admin" | "teacher" | "subjectleader" | "examiner";

export const FOLDER_TO_ROUTE = {
  "messaging": "/messaging",
  "pending-exams": "/pending_exams",
  "statistics": "/statistics",
  "administration": "/administration",
  "exam-bank": "/exam_bank",
  "question-generator": "/question_generator",
  "exam-generator": "/exam_generator",
  "question-bank": "/question_bank",
  "configuration": "/configuration",
  "subjects": "/subjects",
  "exams": "/exams",
} as const;

export type FolderKey = keyof typeof FOLDER_TO_ROUTE;

export const DASHBOARD_PREFIX = ""; 

export const ROLE_ALLOWED_KEYS: Record<Role, FolderKey[]> = {
  admin: [
    "messaging", "pending-exams", "statistics", "administration",
    "exam-bank", "question-generator", "exam-generator",
    "question-bank", "configuration", "subjects", "exams",
  ],
  teacher: [
    "question-bank", "question-generator", "exam-bank", "exam-generator", "messaging", "subjects",
  ],
  subjectleader: [
    "administration", "statistics", "pending-exams", "messaging", "subjects",
  ],
  examiner: [
    "pending-exams", "exams", "messaging",
  ],
  student: [
    "exams", "subjects", "messaging",
  ],
};

function normalize(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

export function folderHref(key: FolderKey) {
  // Ensambla prefijo opcional + ruta
  return normalize(`${DASHBOARD_PREFIX}${FOLDER_TO_ROUTE[key]}`);
}

export function allowedRoutesFor(role: Role | null | undefined): string[] {
  if (!role) return [];
  return (ROLE_ALLOWED_KEYS[role] ?? []).map(folderHref);
}

export function canAccess(pathname: string, role: Role | null | undefined) {
  if (!role) return false;
  const path = normalize(pathname);
  const allowed = allowedRoutesFor(role);

  return (
    allowed.some((p) => path === p || path.startsWith(p + "/"))
  );
}

export const PROTECTED_PATHS = Object.values(FOLDER_TO_ROUTE).map((p) =>
  normalize(`${DASHBOARD_PREFIX}${p}`)
);
