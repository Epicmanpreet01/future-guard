import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

export const useAddinstituteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, email, instituteName, password }) => {
      try {
        const res = await axios.post("/api/auth/admin-register", {
          name,
          email,
          instituteName,
          password,
        });
        const data = res?.data;
        if (res?.status !== 200)
          throw new Error(data?.error || "Failed to add institute");
        return data.data;
      } catch (error) {
        console.error(`Error occured while adding institute: ${error}`);
        throw error;
      }
    },
    onError: () => {
      toast.error("Failed to to add institute");
    },
    onSuccess: () => {
      toast.success("Added institute successfully");
      queryClient.invalidateQueries({ queryKey: ["institutes"] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["aggregations"] });
    },
  });
};

export const useRemoveInstituteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ instituteId }) => {
      try {
        const res = await axios.delete(`/api/institute/${instituteId}`);
        const data = res?.data;
        if (res?.status !== 200)
          throw new Error(data?.error || "Failed to remove institute");
        return data.data;
      } catch (error) {
        console.error(`Error occured while removing institute: ${error}`);
        throw error;
      }
    },
    onError: () => {
      toast.error("Failed to remove institute");
    },
    onSuccess: () => {
      toast.success("Removed institute successfully");
      queryClient.invalidateQueries({ queryKey: ["aggregations"] });
      queryClient.invalidateQueries({ queryKey: ["institutes"] });
    },
  });
};
