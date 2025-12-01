import { TopicDetail } from "./topic";

export type SubjectDetail = {
    subject_id: string;
    subject_name: string;
    subject_program: string;
    subject_leader_name: string;
    subject_leader_id?: string;
    topics_amount: number;
    topics: TopicDetail[];
}


export type CreateSubjectPayload = {
    subject_program: string;
    subject_name: string;
}

export type UpdateSubjectPayload = Partial<CreateSubjectPayload>
