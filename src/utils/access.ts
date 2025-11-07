export enum Role {
  Student = "student",
  Admin = "admin",
  Teacher = "teacher",
  SubjectLeader = "subjectleader",
  Examiner = "examiner",
}

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

const ROLE_VALUES = Object.values(Role) as Role[];

export const ROLE_ALLOWED_KEYS: Record<Role, FolderKey[]> = {
  [Role.Admin]: [
    "messaging", "statistics", "administration", "configuration",
  ],
  [Role.Teacher]: [
    "messaging", "question-bank", "question-generator", "exam-bank","exam-generator","messaging", "configuration",
  ],
  [Role.SubjectLeader]: [
    "administration", "statistics", "pending-exams", "messaging", "subjects",
  ],
  [Role.Examiner]: [
    "exam-bank","exam-generator", "pending-exams", "messaging",
  ],
  [Role.Student]: [
    "exams", "subjects", "messaging",
  ],
};
export function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLE_VALUES.includes(value as Role);
}

function normalize(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

export function folderHref(key: FolderKey) {
  // Ensambla prefijo opcional + ruta
  return normalize(`${DASHBOARD_PREFIX}${FOLDER_TO_ROUTE[key]}`);
}

export function allowedRoutesFor(roles: Role[]): string[] {
  const set = new Set<string>();
  for (const r of roles) for (const k of (ROLE_ALLOWED_KEYS[r] ?? [])) set.add(folderHref(k));
  return Array.from(set);
}

export function allowedKeysFor(roles: Role[]): FolderKey[] {
  const set = new Set<FolderKey>();
  for (const r of roles) for (const k of (ROLE_ALLOWED_KEYS[r] ?? [])) set.add(k);
  return Array.from(set);
}

export function canAccess(pathname: string, roles: Role[]) {
  if (!roles.length) return false;
  const path = normalize(pathname);
  const allowed = allowedRoutesFor(roles);
  return allowed.some((p) => path === p || path.startsWith(p + "/"));
}

export const PROTECTED_PATHS = Object.values(FOLDER_TO_ROUTE).map((p) => normalize(`${DASHBOARD_PREFIX}${p}`));
