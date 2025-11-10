import { useQuestionBankContext } from "./context";

export const useSubjects = () => {
  const {
    subjects,
    loading,
    error,
    refresh,
    createSubject,
    updateSubject,
    deleteSubject,
  } = useQuestionBankContext();

  return {
    subjects,
    loading,
    error,
    refresh,
    createSubject,
    updateSubject,
    deleteSubject,
  };
};
