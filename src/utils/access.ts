export enum Role {
  Student = "student",
  Admin = "admin",
  Teacher = "teacher",
  SubjectLeader = "subject_leader",
  Examiner = "examiner",
}

export const FOLDER_TO_ROUTE = {
  "pending-exams": "/pending_exams",
  "administration": "/administration",
  "exam-bank": "/exam_bank",
  "question-bank": "/question_bank",
  "regrade": "/regrade",
  "exams": "/exams",
  "reports": "/reports",
} as const;

export type FolderKey = keyof typeof FOLDER_TO_ROUTE;

const DASHBOARD_PREFIX = "";
const ROLE_VALUES = Object.values(Role) as Role[];
export const ROLE_ALLOWED_KEYS: Record<Role, FolderKey[]> = {
  [Role.Admin]: [
    "administration", "reports",
  ],
  [Role.Teacher]: [
    "question-bank", "pending-exams", "regrade", "exam-bank",
  ],
  [Role.SubjectLeader]: [
    "question-bank", "pending-exams", "regrade", "reports",
  ],
  [Role.Examiner]: [
    "question-bank", "exam-bank", "pending-exams",
  ],
  [Role.Student]: [
    "exams", 
  ],
};
export function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLE_VALUES.includes(value as Role);
}

// Normaliza la ruta eliminando el slash final cuando no es necesario
function normalize(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

// Construye la URL de una carpeta aplicando el prefijo y normalizando el resultado
function folderHref(key: FolderKey) {
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

export function firstAllowedRouteFor(roles: Role[]): string {
  const routes = allowedRoutesFor(roles);
  if (!routes.length) return "/login";
  return routes[0];
}
