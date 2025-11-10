import { useQuestionBankContext } from "./context";

export const useSubtopics = () => {
  const {
    loading,
    error,
    refresh,
    createSubtopic,
    deleteSubtopic,
  } = useQuestionBankContext();

  return {
    loading,
    error,
    refresh,
    createSubtopic,
    deleteSubtopic,
  };
};
