import type { CreateSubtopicPayload, SubTopicDetail } from "@/types/question-bank/subtopic";
import {
  QUESTION_SUBTOPICS_ENDPOINT,
  USE_MOCK_QUESTION_ADMIN,
  createMockSubtopic,
  findMockTopic,
  normalizeSubject,
  request,
  updateMockSubjects,
} from "./base";

export const createSubtopic = async (payload: CreateSubtopicPayload): Promise<SubTopicDetail> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    const match = findMockTopic(payload.topic_associated_id);
    if (!match) throw new Error("Tópico no encontrado");
    const newSubtopic = createMockSubtopic(payload.subtopic_name);

    updateMockSubjects((subjects) =>
      subjects.map((subject) => {
        if (subject.subject_id === match.subject.subject_id) {
          return normalizeSubject({
            ...subject,
            topics: subject.topics.map((topic) =>
              topic.topic_id === match.topic.topic_id
                ? {
                    ...topic,
                    subtopics: [...topic.subtopics, newSubtopic],
                  }
                : topic,
            ),
          });
        }
        return subject;
      }),
    );

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
    updateMockSubjects((subjects) =>
      subjects.map((subject) =>
        normalizeSubject({
          ...subject,
          topics: subject.topics.map((topic) => ({
            ...topic,
            subtopics: topic.subtopics.filter((subtopic) => subtopic.subtopic_id !== subtopicId),
          })),
        }),
      ),
    );
    return;
  }
  await request<void>(`${QUESTION_SUBTOPICS_ENDPOINT}/${subtopicId}`, { method: "DELETE" });
};
