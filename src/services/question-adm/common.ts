import type { SubjectDetail } from "@/types/question_administration";

// Endpoints base
export const QUESTION_TYPES_ENDPOINT =
  "/api/proxy/api/question-bank/question-types";
export const QUESTION_SUBJECTS_ENDPOINT =
  "/api/proxy/api/question-bank/subjects";
export const QUESTION_TOPICS_ENDPOINT =
  "/api/proxy/api/question-bank/topics";
export const QUESTION_SUBTOPICS_ENDPOINT =
  "/api/proxy/api/question-bank/subtopics";

// Flag global para usar mocks
export const USE_MOCK_QUESTION_ADMIN =
  process.env.NEXT_PUBLIC_USE_MOCK_QUESTION_ADMIN === "true";

// -------------------- HTTP helpers compartidos --------------------

export const request = async <T>(
  url: string,
  init?: RequestInit
): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export const extractErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    return (data)?.message ?? `Error ${response.status}`;
  } catch {
    return response.statusText || "Error de red";
  }
};

// Si la API devuelve { data: T }, lo extraemos; si no, devolvemos tal cual
export const unwrap = <T>(payload: unknown): T =>
  payload && typeof payload === "object" && "data" in (payload)
    ? ((payload).data as T)
    : (payload as T);

// ID simple para mocks
export const randomId = () => Math.random().toString(36).slice(2);

// -------------------- Normalización de materias --------------------

export const normalizeSubject = (subject: SubjectDetail): SubjectDetail => ({
  ...subject,
  topics_amount: subject.topics.length,
  topics: subject.topics.map((topic) => ({
    ...topic,
    subtopics_amount: topic.subtopics.length,
    subtopics: topic.subtopics.map((subtopic) => ({ ...subtopic })),
  })),
});

export const normalizeSubjects = (subjects: SubjectDetail[]): SubjectDetail[] =>
  subjects.map(normalizeSubject);

// -------------------- Mocks para materias / tópicos --------------------

export const mockSubjects: SubjectDetail[] = normalizeSubjects([
  {
    subject_id: "subject-1",
    subject_name: "Ciencia de la Computación",
    subject_program: "Licenciatura en Computación",
    subject_leader_name: "Roberto Martínez",
    topics_amount: 0,
    topics: [
      {
        topic_id: "topic-1",
        topic_name: "Algoritmos",
        subject_id: "subject-1",
        subject_name: "Ciencia de la Computación",
        subtopics_amount: 0,
        subtopics: [
          { subtopic_id: "subtopic-1", subtopic_name: "Ordenamiento" },
          { subtopic_id: "subtopic-2", subtopic_name: "Búsqueda" },
          { subtopic_id: "subtopic-3", subtopic_name: "Recursión" },
        ],
      },
      {
        topic_id: "topic-2",
        topic_name: "Estructuras de Datos",
        subject_id: "subject-1",
        subject_name: "Ciencia de la Computación",
        subtopics_amount: 0,
        subtopics: [
          { subtopic_id: "subtopic-4", subtopic_name: "Listas" },
          { subtopic_id: "subtopic-5", subtopic_name: "Árboles" },
          { subtopic_id: "subtopic-6", subtopic_name: "Grafos" },
        ],
      },
    ],
  },
  {
    subject_id: "subject-2",
    subject_name: "Matemáticas Discretas",
    subject_program: "Licenciatura en Computación",
    subject_leader_name: "Carmen Silva",
    topics_amount: 0,
    topics: [
      {
        topic_id: "topic-3",
        topic_name: "Lógica Proposicional",
        subject_id: "subject-2",
        subject_name: "Matemáticas Discretas",
        subtopics_amount: 0,
        subtopics: [
          { subtopic_id: "subtopic-7", subtopic_name: "Tablas de Verdad" },
          { subtopic_id: "subtopic-8", subtopic_name: "Inferencias" },
        ],
      },
    ],
  },
]);


export const ensureSubjectExists = (subjectId: string): SubjectDetail => {
  const subject = mockSubjects.find((s) => s.subject_id === subjectId);
  if (!subject) {
    throw new Error("Materia no encontrada");
  }
  return subject;
};

export const ensureTopicExists = (topicId: string) => {
  for (const subject of mockSubjects) {
    const topic = subject.topics.find((t) => t.topic_id === topicId);
    if (topic) {
      return { subject, topic };
    }
  }
  throw new Error("Tópico no encontrado");
};
