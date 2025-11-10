import type { SubTopicDetail } from "./subtopic";

export type TopicDetail = {
  topic_id: string;
  topic_name: string;
  subject_id: string;
  subject_name: string;
  subtopics_amount: number;
  subtopics: SubTopicDetail[];
};

export type CreateTopicPayload = {
  subject_associated_id: string;
  topic_name: string;
};

export type UpdateTopicPayload = Partial<CreateTopicPayload>;
