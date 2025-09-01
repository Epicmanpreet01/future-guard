import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }) => {
      try {
        const res = await axios.post("/api/auth/login", { email, password });
        const data = res.data;
        if (!data) throw new Error("Data not found");
        return data;
      } catch (error) {
        console.error(`Error occured while logging in: ${error}`);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Login successful");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      console.error(`Error occured in mutation: ${error.message}`);
      toast.error(error.response?.data?.message || "Failed to login");
    },
  });
};
