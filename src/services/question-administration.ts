import {
  get_question_subjects_url,
  get_question_subtopics_url,
  get_question_topics_url,
  get_question_types_url,
} from "@/config/backend";
import type {
  CreateQuestionTypePayload,
  CreateSubjectPayload,
  CreateSubtopicPayload,
  CreateTopicPayload,
  QuestionTypeDetail,
  SubjectDetail,
  SubTopicDetail,
  TopicDetail,
  UpdateSubjectPayload,
  UpdateTopicPayload,
} from "@/types/question_administration";

const QUESTION_TYPES_ENDPOINT = get_question_types_url();
const QUESTION_SUBJECTS_ENDPOINT = get_question_subjects_url();
const QUESTION_TOPICS_ENDPOINT = get_question_topics_url();
const QUESTION_SUBTOPICS_ENDPOINT = get_question_subtopics_url();

const USE_MOCK_QUESTION_ADMIN = process.env.NEXT_PUBLIC_USE_MOCK_QUESTION_ADMIN === "true";

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
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
}; //TODO: SACAR ESTA REQUEST ?

const extractErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    return data?.message ?? `Error ${response.status}`;
  } catch {
    return response.statusText || "Error de red";
  }
};

const randomId = () => Math.random().toString(36).slice(2);

const normalizeSubject = (subject: SubjectDetail): SubjectDetail => ({
  ...subject,
  topics_amount: subject.topics.length,
  topics: subject.topics.map((topic) => ({
    ...topic,
    subtopics_amount: topic.subtopics.length,
    subtopics: topic.subtopics.map((subtopic) => ({ ...subtopic })),
  })),
});

const normalizeSubjects = (subjects: SubjectDetail[]) => subjects.map(normalizeSubject);

const cloneQuestionTypes = (types: QuestionTypeDetail[]) => types.map((type) => ({ ...type }));

let mockQuestionTypes: QuestionTypeDetail[] = [
  { question_type_id: "type-1", question_type_name: "Ensayo" },
  { question_type_id: "type-2", question_type_name: "Selección Múltiple" },
  { question_type_id: "type-3", question_type_name: "Verdadero / Falso" },
];

let mockSubjects: SubjectDetail[] = normalizeSubjects([
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

const ensureSubjectExists = (subjectId: string) => {
  const subject = mockSubjects.find((s) => s.subject_id === subjectId);
  if (!subject) {
    throw new Error("Materia no encontrada");
  }
  return subject;
};

const ensureTopicExists = (topicId: string) => {
  for (const subject of mockSubjects) {
    const topic = subject.topics.find((t) => t.topic_id === topicId);
    if (topic) {
      return { subject, topic };
    }
  }
  throw new Error("Tópico no encontrado");
};

export const fetchQuestionTypes = async (): Promise<QuestionTypeDetail[]> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    return cloneQuestionTypes(mockQuestionTypes);
  }
  return request<QuestionTypeDetail[]>(QUESTION_TYPES_ENDPOINT);
};

export const fetchSubjects = async (): Promise<SubjectDetail[]> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    return normalizeSubjects(mockSubjects);
  }
  const subjects = await request<SubjectDetail[]>(QUESTION_SUBJECTS_ENDPOINT);
  return normalizeSubjects(subjects);
};

export const createQuestionType = async (payload: CreateQuestionTypePayload): Promise<QuestionTypeDetail> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    const newType: QuestionTypeDetail = {
      question_type_id: randomId(),
      question_type_name: payload.question_type_name,
    };
    mockQuestionTypes = [...mockQuestionTypes, newType];
    return newType;
  }
  return request<QuestionTypeDetail>(QUESTION_TYPES_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const deleteQuestionType = async (questionTypeId: string): Promise<void> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    mockQuestionTypes = mockQuestionTypes.filter((type) => type.question_type_id !== questionTypeId);
    return;
  }
  await request<void>(`${QUESTION_TYPES_ENDPOINT}/${questionTypeId}`, { method: "DELETE" });
};

export const createSubject = async (payload: CreateSubjectPayload): Promise<SubjectDetail> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    const newSubject: SubjectDetail = normalizeSubject({
      subject_id: randomId(),
      subject_name: payload.subject_name,
      subject_program: payload.subject_program,
      subject_leader_name: "",
      topics_amount: 0,
      topics: [],
    });
    mockSubjects = [...mockSubjects, newSubject];
    return newSubject;
  }
  const created = await request<SubjectDetail>(QUESTION_SUBJECTS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeSubject(created);
};

export const updateSubject = async (
  subjectId: string,
  payload: UpdateSubjectPayload,
): Promise<SubjectDetail> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    let updatedSubject: SubjectDetail | null = null;
    mockSubjects = mockSubjects.map((subject) => {
      if (subject.subject_id === subjectId) {
        updatedSubject = normalizeSubject({
          ...subject,
          subject_name: payload.subject_name ?? subject.subject_name,
          subject_program: payload.subject_program ?? subject.subject_program,
        });
        return updatedSubject;
      }
      return subject;
    });
    if (!updatedSubject) {
      throw new Error("Materia no encontrada");
    }
    return updatedSubject;
  }
  const updated = await request<SubjectDetail>(`${QUESTION_SUBJECTS_ENDPOINT}/${subjectId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return normalizeSubject(updated);
};

export const deleteSubject = async (subjectId: string): Promise<void> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    mockSubjects = mockSubjects.filter((subject) => subject.subject_id !== subjectId);
    return;
  }
  await request<void>(`${QUESTION_SUBJECTS_ENDPOINT}/${subjectId}`, { method: "DELETE" });
};

export const createTopic = async (payload: CreateTopicPayload): Promise<TopicDetail> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    const subject = ensureSubjectExists(payload.subject_associated_id);
    const newTopic: TopicDetail = {
      topic_id: randomId(),
      topic_name: payload.topic_name,
      subject_id: subject.subject_id,
      subject_name: subject.subject_name,
      subtopics_amount: 0,
      subtopics: [],
    };
    mockSubjects = mockSubjects.map((s) =>
      s.subject_id === subject.subject_id ? normalizeSubject({ ...s, topics: [...s.topics, newTopic] }) : s,
    );
    return newTopic;
  }
  const created = await request<TopicDetail>(QUESTION_TOPICS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return {
    ...created,
    subtopics: created.subtopics.map((subtopic) => ({ ...subtopic })),
  };
};

export const updateTopic = async (topicId: string, payload: UpdateTopicPayload): Promise<TopicDetail> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    const { subject, topic } = ensureTopicExists(topicId);
    const currentSubjectId = subject.subject_id;
    const targetSubjectId = payload.subject_associated_id ?? currentSubjectId;
    const targetSubject = ensureSubjectExists(targetSubjectId);

    const updatedTopic: TopicDetail = {
      ...topic,
      topic_name: payload.topic_name ?? topic.topic_name,
      subject_id: targetSubject.subject_id,
      subject_name: targetSubject.subject_name,
    };

    let subjects = mockSubjects.map((s) => {
      if (s.subject_id === currentSubjectId) {
        return normalizeSubject({
          ...s,
          topics: s.topics.filter((existing) => existing.topic_id !== topicId),
        });
      }
      return s;
    });

    subjects = subjects.map((s) => {
      if (s.subject_id === targetSubject.subject_id) {
        return normalizeSubject({
          ...s,
          topics: [...s.topics.filter((existing) => existing.topic_id !== topicId), updatedTopic],
        });
      }
      return s;
    });

    mockSubjects = subjects;
    return updatedTopic;
  }

  const updated = await request<TopicDetail>(`${QUESTION_TOPICS_ENDPOINT}/${topicId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return {
    ...updated,
    subtopics: updated.subtopics.map((subtopic) => ({ ...subtopic })),
  };
};

export const deleteTopic = async (topicId: string): Promise<void> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    const { subject } = ensureTopicExists(topicId);
    mockSubjects = mockSubjects.map((current) =>
      current.subject_id === subject.subject_id
        ? normalizeSubject({
            ...current,
            topics: current.topics.filter((topic) => topic.topic_id !== topicId),
          })
        : current,
    );
    return;
  }
  await request<void>(`${QUESTION_TOPICS_ENDPOINT}/${topicId}`, { method: "DELETE" });
};

export const createSubtopic = async (payload: CreateSubtopicPayload): Promise<SubTopicDetail> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    const { subject, topic } = ensureTopicExists(payload.topic_associated_id);
    const newSubtopic: SubTopicDetail = {
      subtopic_id: randomId(),
      subtopic_name: payload.subtopic_name,
    };

    mockSubjects = mockSubjects.map((s) => {
      if (s.subject_id === subject.subject_id) {
        return normalizeSubject({
          ...s,
          topics: s.topics.map((t) =>
            t.topic_id === topic.topic_id
              ? {
                  ...t,
                  subtopics: [...t.subtopics, newSubtopic],
                }
              : t,
          ),
        });
      }
      return s;
    });

    return newSubtopic;
  }
  const created = await request<SubTopicDetail>(QUESTION_SUBTOPICS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return created;
};

export const deleteSubtopic = async (subtopicId: string): Promise<void> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    mockSubjects = mockSubjects.map((subject) =>
      normalizeSubject({
        ...subject,
        topics: subject.topics.map((topic) => ({
          ...topic,
          subtopics: topic.subtopics.filter((subtopic) => subtopic.subtopic_id !== subtopicId),
        })),
      }),
    );
    return;
  }
  await request<void>(`${QUESTION_SUBTOPICS_ENDPOINT}/${subtopicId}`, { method: "DELETE" });
};
