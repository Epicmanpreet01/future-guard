import { useQueryClient, useQuery } from "@tanstack/react-query";

const STUDENTS_QUERY_KEY = ["uploadedStudents"];

export const useUploadedStudents = () => {
  return useQuery({
    queryKey: STUDENTS_QUERY_KEY,
    queryFn: () => [],
    staleTime: Infinity,
    enabled: false, // never auto-fetch
  });
};

export const useSetUploadedStudents = () => {
  const queryClient = useQueryClient();

  return (students) => {
    queryClient.setQueryData(STUDENTS_QUERY_KEY, students);
  };
};
