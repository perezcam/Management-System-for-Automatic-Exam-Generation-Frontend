import { SubTopicDetail } from "./subtopic";

export type TopicDetail = {
    topic_id: string;
    topic_name: string;
    subtopics_amount: number;
    subtopics: SubTopicDetail[];
}

export type CreateTopicPayload = {
    topic_name: string;
}

export type UpdateTopicPayload = Partial<CreateTopicPayload>