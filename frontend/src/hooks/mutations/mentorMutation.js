import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

export const useAddMentorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, email, department, password }) => {
      try {
        const res = await axios.post("/api/auth/mentor-register", {
          name,
          email,
          department,
          password,
        });
        const data = res?.data;
        if (res?.status !== 200)
          throw new Error(data?.error || "Failed to add mentor");
        return data?.data;
      } catch (error) {
        console.error(`Error occured while adding mentor: ${error}`);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
      queryClient.invalidateQueries({ queryKey: ["aggregations"] });
    },
    onError: () => {
      toast.error("Failed to add mentor");
    },
  });
};

export const useUpdateMentorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ department, status, mentorId }) => {
      try {
        const res = await axios.post(`/api/user/mentor/${mentorId}`, {
          department,
          status,
        });
        const data = res?.data;
        if (res?.status !== 200)
          throw new Error(data?.error || "Failed to update mentor");
        return data?.data;
      } catch (error) {
        console.error(`Error occured while updating mentor: ${error}`);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
      queryClient.invalidateQueries({ queryKey: ["aggregations"] });
    },
  });
};

export const useRemoveMentorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ mentorId }) => {
      try {
        const res = await axios.delete(`/api/user/mentor/${mentorId}`);
        const data = res?.data;
        if (res?.status !== 200)
          throw new Error(data?.error || "Failed to remove mentor");
        return data?.data;
      } catch (error) {
        console.error(`Error occured while removing mentor: ${error}`);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
      queryClient.invalidateQueries({ queryKey: ["aggregations"] });
    },
    onError: () => {
      toast.error(`Failed to remove mentor`);
    },
  });
};
