import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { useSetUploadedStudents } from "../queries/useUploadStudents";
import { useQueryClient } from "@tanstack/react-query";

export const useUploadStudentsMutation = () => {
  const setStudents = useSetUploadedStudents();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files) => {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      const res = await axios.post("/api/mentor/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    },

    onSuccess: (data) => {
      const students = data?.data?.[0]?.students ?? [];

      setStudents(students);

      queryClient.invalidateQueries(["aggregations"]);

      toast.success("Students processed successfully");
    },

    onError: () => {
      toast.error("Failed to upload students");
    },
  });
};
