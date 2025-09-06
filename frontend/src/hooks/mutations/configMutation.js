import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

export const useGenerateDraft = (options = {}) => {
  const {
    onSuccess: componentOnSuccess,
    onError: componentOnError,
    ...restOptions
  } = options;

  return useMutation({
    ...restOptions,
    mutationFn: async (headers) => {
      try {
        const res = await axios.post("/api/institute/config/draft", {
          headers,
        });
        if (res?.status !== 200)
          throw new Error(res?.data?.error || "Failed to generate draft");
        return res.data;
      } catch (error) {
        console.error(`Error occurred while generating draft: ${error}`);
        throw error.response?.data || new Error("An unknown error occurred");
      }
    },
    onSuccess: (data, variables, context) => {
      toast.success("Generated draft successfully");
      if (componentOnSuccess) {
        componentOnSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      toast.error(error.error || "Failed to generate draft");
      if (componentOnError) {
        componentOnError(error, variables, context);
      }
    },
  });
};

export const useSaveConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (draft) => {
      try {
        const res = await axios.put("/api/institute/config", {
          columns: draft,
        });
        const data = res?.data;
        if (res?.status !== 200)
          throw new Error(data?.error || "Failed to save config");
        return data?.data;
      } catch (error) {
        console.error(`Error occured while saving config`);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Saves config successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => {
      toast.error("Failed to save config");
    },
  });
};

export const useLockConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ instituteId, lock }) => {
      try {
        const res = await axios.patch(
          `/api/institute/config/lock/${instituteId}`,
          { lock }
        );
        const data = res?.data;
        if (res?.status !== 200)
          throw new Error(data?.error || "Failed to lock config");
        return data?.data;
      } catch (error) {
        console.error(`Error occured while locking config: ${error}`);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Locked config successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });
};
