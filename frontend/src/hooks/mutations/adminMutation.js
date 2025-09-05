import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";

export const useUpdateStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ status, adminId }) => {
      try {
        const res = await axios.post(`/api/user/admin/${adminId}`, { status });
        const data = res?.data;
        if (res?.status !== 200)
          throw new Error(res?.error || "Failed to update status");
        return data?.data;
      } catch (error) {
        console.error(
          `Error occured while changing status of institute: ${error}`
        );
        throw error;
      }
    },
    onError: () => {
      toast.error("Failed to update admin status");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["institutes"] });
      queryClient.invalidateQueries({ queryKey: ["aggregations"] });
    },
  });
};
