import type {
  CreateSubtopicPayload,
  SubTopicDetail,
  SubjectDetail,
  TopicDetail,
} from "@/types/question_administration";
import {
  QUESTION_SUBTOPICS_ENDPOINT,
  USE_MOCK_QUESTION_ADMIN,
  mockSubjects,
  normalizeSubject,
  request,
  unwrap,
  randomId,
} from "./common";

export const createSubtopic = async (
  payload: CreateSubtopicPayload
): Promise<SubTopicDetail> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    const subjectIndex = mockSubjects.findIndex((s) =>
      s.topics.some((t) => t.topic_id === payload.topic_associated_id)
    );
    if (subjectIndex === -1) {
      throw new Error("Tópico no encontrado");
    }

    const subject = mockSubjects[subjectIndex];
    const topicIndex = subject.topics.findIndex(
      (t) => t.topic_id === payload.topic_associated_id
    );
    const topic = subject.topics[topicIndex];

    const newSubtopic: SubTopicDetail = {
      subtopic_id: randomId(),
      subtopic_name: payload.subtopic_name,
    };

    const updatedTopic: TopicDetail = {
      ...topic,
      subtopics: [...topic.subtopics, newSubtopic],
      subtopics_amount: topic.subtopics.length + 1,
    };

    const newTopics = subject.topics.slice();
    newTopics[topicIndex] = updatedTopic;

    const updatedSubject: SubjectDetail = normalizeSubject({
      ...subject,
      topics: newTopics,
    });

    mockSubjects[subjectIndex] = updatedSubject;

    return newSubtopic;
  }

  const resp = await request<unknown>(QUESTION_SUBTOPICS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return unwrap<SubTopicDetail>(resp);
};

export const deleteSubtopic = async (subtopicId: string): Promise<void> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    for (let sIdx = 0; sIdx < mockSubjects.length; sIdx++) {
      const subject = mockSubjects[sIdx];
      let modified = false;

      const newTopics = subject.topics.map((topic) => {
        const newSubtopics = topic.subtopics.filter(
          (st) => st.subtopic_id !== subtopicId
        );
        if (newSubtopics.length !== topic.subtopics.length) {
          modified = true;
          return {
            ...topic,
            subtopics: newSubtopics,
            subtopics_amount: newSubtopics.length,
          };
        }
        return topic;
      });

      if (modified) {
        const updatedSubject: SubjectDetail = normalizeSubject({
          ...subject,
          topics: newTopics,
        });
        mockSubjects[sIdx] = updatedSubject;
        break;
      }
    }
    return;
  }

  await request<void>(`${QUESTION_SUBTOPICS_ENDPOINT}/${subtopicId}`, {
    method: "DELETE",
  });
};
