export type SubTopicDetail = {
  subtopic_id: string;
  subtopic_name: string;
};

export type CreateSubtopicPayload = {
  topic_associated_id: string;
  subtopic_name: string;
};
