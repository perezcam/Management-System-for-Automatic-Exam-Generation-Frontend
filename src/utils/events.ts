export const ASSIGNMENT_GRADED_EVENT = "assignment-graded";

export type AssignmentGradedEventDetail = {
  assignmentId: string;
};

export const dispatchAssignmentGradedEvent = (assignmentId: string) => {
  if (typeof window === "undefined" || !assignmentId) {
    return;
  }

  const event = new CustomEvent<AssignmentGradedEventDetail>(ASSIGNMENT_GRADED_EVENT, {
    detail: { assignmentId },
  });

  window.dispatchEvent(event);
};
