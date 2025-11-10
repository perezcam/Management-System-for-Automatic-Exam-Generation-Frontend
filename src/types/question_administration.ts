//Read schemas
export type TotalsDetail = {
    total_question_types: number;
    total_subjects: number;
    total_topics: number;
    total_subtopics: number;
}

export type QuestionTypeDetail = {
    question_type_id: string;
    question_type_name: string;
}

export type SubjectDetail = {
    subject_id: string;
    subject_name: string;
    subject_program: string;
    subject_leader_name: string;
    topics_amount: number;
    topics: TopicDetail[];
}

export type TopicDetail = {
    topic_id: string;
    topic_name: string;
    subject_id: string;
    subject_name: string;
    subtopics_amount: number;
    subtopics: SubTopicDetail[];
}

export type SubTopicDetail = {
    subtopic_id: string;
    subtopic_name: string;
}

//CREATE SCHEMAS
export type CreateQuestionTypePayload = {
    question_type_name: string;
}

export type CreateSubjectPayload = {
    subject_program: string;
    subject_name: string;
}

export type CreateTopicPayload = {
    subject_associated_id: string;
    topic_name: string;
}

export type CreateSubtopicPayload = {
    topic_associated_id: string;
    subtopic_name: string;
}

//Update schemas
export type UpdateSubjectPayload = Partial<CreateSubjectPayload>
export type UpdateTopicPayload = Partial<CreateTopicPayload>

