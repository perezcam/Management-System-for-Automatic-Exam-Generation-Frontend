import {
  get_question_subjects_url,
  get_question_subtopics_url,
  get_question_topics_url,
  get_question_types_url,
} from "@/config/backend";
import type {
  QuestionTypeDetail,
  SubjectDetail,
  SubTopicDetail,
  TopicDetail,
} from "@/types/question-bank";

export const QUESTION_TYPES_ENDPOINT = get_question_types_url();
export const QUESTION_SUBJECTS_ENDPOINT = get_question_subjects_url();
export const QUESTION_TOPICS_ENDPOINT = get_question_topics_url();
export const QUESTION_SUBTOPICS_ENDPOINT = get_question_subtopics_url();

export const USE_MOCK_QUESTION_ADMIN = process.env.NEXT_PUBLIC_USE_MOCK_QUESTION_ADMIN === "true";

export const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
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
    return data?.message ?? `Error ${response.status}`;
  } catch {
    return response.statusText || "Error de red";
  }
};

export const normalizeSubject = (subject: SubjectDetail): SubjectDetail => ({
  ...subject,
  topics_amount: subject.topics.length,
  topics: subject.topics.map((topic) => ({
    ...topic,
    subtopics_amount: topic.subtopics.length,
    subtopics: topic.subtopics.map((subtopic) => ({ ...subtopic })),
  })),
});

export const normalizeSubjects = (subjects: SubjectDetail[]) => subjects.map(normalizeSubject);

export const cloneQuestionTypes = (types: QuestionTypeDetail[]) => types.map((type) => ({ ...type }));

const initialMockSubjects: SubjectDetail[] = normalizeSubjects([
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

let mockQuestionTypes: QuestionTypeDetail[] = [
  { question_type_id: "type-1", question_type_name: "Ensayo" },
  { question_type_id: "type-2", question_type_name: "Selección Múltiple" },
  { question_type_id: "type-3", question_type_name: "Verdadero / Falso" },
];

let mockSubjects: SubjectDetail[] = initialMockSubjects;

export const readMockQuestionTypes = () => mockQuestionTypes;
export const updateMockQuestionTypes = (
  updater: (types: QuestionTypeDetail[]) => QuestionTypeDetail[],
): QuestionTypeDetail[] => {
  mockQuestionTypes = updater(mockQuestionTypes);
  return mockQuestionTypes;
};

export const readMockSubjects = () => mockSubjects;
export const replaceMockSubjects = (subjects: SubjectDetail[]) => {
  mockSubjects = normalizeSubjects(subjects);
  return mockSubjects;
};
export const updateMockSubjects = (
  updater: (subjects: SubjectDetail[]) => SubjectDetail[],
): SubjectDetail[] => replaceMockSubjects(updater(mockSubjects));

export const findMockSubject = (subjectId: string) => mockSubjects.find((subject) => subject.subject_id === subjectId);

export const findMockTopic = (topicId: string): { subject: SubjectDetail; topic: TopicDetail } | null => {
  for (const subject of mockSubjects) {
    const topic = subject.topics.find((t) => t.topic_id === topicId);
    if (topic) {
      return { subject, topic };
    }
  }
  return null;
};

export const createMockSubtopic = (subtopic_name: string): SubTopicDetail => ({
  subtopic_id: Math.random().toString(36).slice(2),
  subtopic_name,
});

export const createRandomId = () => Math.random().toString(36).slice(2);
