import type { CreateTopicPayload, TopicDetail, UpdateTopicPayload } from "@/types/question-bank/topic";
import {
  QUESTION_TOPICS_ENDPOINT,
  USE_MOCK_QUESTION_ADMIN,
  createRandomId,
  findMockSubject,
  findMockTopic,
  normalizeSubject,
  request,
  updateMockSubjects,
} from "./base";

export const createTopic = async (payload: CreateTopicPayload): Promise<TopicDetail> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    const subject = findMockSubject(payload.subject_associated_id);
    if (!subject) throw new Error("Materia no encontrada");

    const newTopic: TopicDetail = {
      topic_id: createRandomId(),
      topic_name: payload.topic_name,
      subject_id: subject.subject_id,
      subject_name: subject.subject_name,
      subtopics_amount: 0,
      subtopics: [],
    };

    updateMockSubjects((subjects) =>
      subjects.map((s) =>
        s.subject_id === subject.subject_id ? normalizeSubject({ ...s, topics: [...s.topics, newTopic] }) : s,
      ),
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
    const match = findMockTopic(topicId);
    if (!match) throw new Error("Tópico no encontrado");

    const { subject: currentSubject, topic } = match;
    const targetSubjectId = payload.subject_associated_id ?? currentSubject.subject_id;
    const targetSubject = findMockSubject(targetSubjectId);
    if (!targetSubject) throw new Error("Materia no encontrada");

    const updatedTopic: TopicDetail = {
      ...topic,
      topic_name: payload.topic_name ?? topic.topic_name,
      subject_id: targetSubject.subject_id,
      subject_name: targetSubject.subject_name,
    };

    updateMockSubjects((subjects) =>
      subjects.map((subject) => {
        if (subject.subject_id === currentSubject.subject_id) {
          return normalizeSubject({
            ...subject,
            topics: subject.topics.filter((existing) => existing.topic_id !== topicId),
          });
        }
        if (subject.subject_id === targetSubject.subject_id) {
          const withoutTopic = subject.topics.filter((existing) => existing.topic_id !== topicId);
          return normalizeSubject({
            ...subject,
            topics: [...withoutTopic, updatedTopic],
          });
        }
        return subject;
      }),
    );

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
    const match = findMockTopic(topicId);
    if (!match) return;

    updateMockSubjects((subjects) =>
      subjects.map((subject) =>
        subject.subject_id === match.subject.subject_id
          ? normalizeSubject({
              ...subject,
              topics: subject.topics.filter((topic) => topic.topic_id !== topicId),
            })
          : subject,
      ),
    );
    return;
  }
  await request<void>(`${QUESTION_TOPICS_ENDPOINT}/${topicId}`, { method: "DELETE" });
};
