import type {
  CreateTopicPayload,
  TopicDetail,
  UpdateTopicPayload,
  SubjectDetail,
} from "@/types/question_administration";
import {
  QUESTION_TOPICS_ENDPOINT,
  USE_MOCK_QUESTION_ADMIN,
  mockSubjects,
  normalizeSubject,
  request,
  unwrap,
  randomId,
} from "./common";
import  { DEFAULT_PAGE_SIZE, type PaginationParams, type PaginatedResult } from "@/types/question_administration";


const cloneTopic = (topic: TopicDetail): TopicDetail => ({
  ...topic,
  subtopics: topic.subtopics.map((s) => ({ ...s })),
});

const allMockTopics = (): TopicDetail[] => {
  const topics: TopicDetail[] = [];
  for (const subject of mockSubjects) {
    for (const topic of subject.topics) {
      topics.push(cloneTopic(topic));
    }
  }
  return topics;
};

export type TopicsPaginationParams = PaginationParams & {
  subjectId?: string; 
};

export const fetchTopicsPaginated = async (
  params: TopicsPaginationParams = {}
): Promise<PaginatedResult<TopicDetail>> => {
  const { limit = DEFAULT_PAGE_SIZE, offset = 0, subjectId } = params;

  if (USE_MOCK_QUESTION_ADMIN) {
    let topics = allMockTopics();
    if (subjectId) {
      topics = topics.filter((t) => t.subject_id === subjectId);
    }

    const total = topics.length;
    const data = topics.slice(offset, offset + limit);

    return {
      data,
      meta: { limit, offset, total },
    };
  }

  const searchParams = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  if (subjectId) {
    searchParams.set("subject_id", subjectId);
  }

  const resp = await request<PaginatedResult<TopicDetail>>(
    `${QUESTION_TOPICS_ENDPOINT}?${searchParams.toString()}`
  );

  return {
    data: resp.data.map(cloneTopic),
    meta: resp.meta,
  };
};

export const fetchTopics = async (): Promise<TopicDetail[]> => {
  const { data } = await fetchTopicsPaginated();
  return data;
};

export const createTopic = async (
  payload: CreateTopicPayload
): Promise<TopicDetail> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    const subjectIndex = mockSubjects.findIndex(
      (s) => s.subject_id === payload.subject_associated_id
    );
    if (subjectIndex === -1) {
      throw new Error("Materia no encontrada");
    }

    const subject = mockSubjects[subjectIndex];

    const newTopic: TopicDetail = {
      topic_id: randomId(),
      topic_name: payload.topic_name,
      subject_id: subject.subject_id,
      subject_name: subject.subject_name,
      subtopics_amount: 0,
      subtopics: [],
    };

    const updatedSubject: SubjectDetail = normalizeSubject({
      ...subject,
      topics: [...subject.topics, newTopic],
    });

    mockSubjects[subjectIndex] = updatedSubject;

    return newTopic;
  }

  const resp = await request<unknown>(QUESTION_TOPICS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const created = unwrap<TopicDetail>(resp);
  return cloneTopic(created);
};

export const updateTopic = async (
  topicId: string,
  payload: UpdateTopicPayload
): Promise<TopicDetail> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    const currentSubjectIndex = mockSubjects.findIndex((s) =>
      s.topics.some((t) => t.topic_id === topicId)
    );
    if (currentSubjectIndex === -1) {
      throw new Error("Tópico no encontrado");
    }

    const currentSubject = mockSubjects[currentSubjectIndex];
    const topicIndex = currentSubject.topics.findIndex(
      (t) => t.topic_id === topicId
    );
    const currentTopic = currentSubject.topics[topicIndex];

    const targetSubjectId =
      payload.subject_associated_id ?? currentSubject.subject_id;

    const targetSubjectIndex = mockSubjects.findIndex(
      (s) => s.subject_id === targetSubjectId
    );
    if (targetSubjectIndex === -1) {
      throw new Error("Materia destino no encontrada");
    }

    const targetSubject = mockSubjects[targetSubjectIndex];

    const updatedTopic: TopicDetail = {
      ...currentTopic,
      topic_name: payload.topic_name ?? currentTopic.topic_name,
      subject_id: targetSubject.subject_id,
      subject_name: targetSubject.subject_name,
    };

    if (currentSubjectIndex === targetSubjectIndex) {
      const newTopics = currentSubject.topics.map((t) =>
        t.topic_id === topicId ? updatedTopic : t
      );
      mockSubjects[currentSubjectIndex] = normalizeSubject({
        ...currentSubject,
        topics: newTopics,
      });
    } else {
      const newCurrentTopics = currentSubject.topics.filter(
        (t) => t.topic_id !== topicId
      );
      mockSubjects[currentSubjectIndex] = normalizeSubject({
        ...currentSubject,
        topics: newCurrentTopics,
      });

      const newTargetTopics = [
        ...targetSubject.topics.filter((t) => t.topic_id !== topicId),
        updatedTopic,
      ];
      mockSubjects[targetSubjectIndex] = normalizeSubject({
        ...targetSubject,
        topics: newTargetTopics,
      });
    }

    return updatedTopic;
  }

  const resp = await request<unknown>(
    `${QUESTION_TOPICS_ENDPOINT}/${topicId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
  const updated = unwrap<TopicDetail>(resp);
  return cloneTopic(updated);
};

export const deleteTopic = async (topicId: string): Promise<void> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    const subjectIndex = mockSubjects.findIndex((s) =>
      s.topics.some((t) => t.topic_id === topicId)
    );
    if (subjectIndex === -1) {
      return;
    }

    const subject = mockSubjects[subjectIndex];
    const newTopics = subject.topics.filter((t) => t.topic_id !== topicId);

    mockSubjects[subjectIndex] = normalizeSubject({
      ...subject,
      topics: newTopics,
    });

    return;
  }

  await request<void>(`${QUESTION_TOPICS_ENDPOINT}/${topicId}`, {
    method: "DELETE",
  });
};
