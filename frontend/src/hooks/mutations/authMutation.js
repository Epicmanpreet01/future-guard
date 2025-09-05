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

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const res = await axios.post("/api/auth/logout");

        if (res.status !== 200) {
          throw new Error("Logout failed");
        }
        return res.data;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "An error occurred during logout."
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Loggedout successfully");
    },
    onError: (error) => {
      console.error("Logout error:", error.message);
      toast.error("Failed to Logout");
    },
  });
};
