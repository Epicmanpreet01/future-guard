import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function useAuthUser() {
  return useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await axios("/api/auth/me");
      const data = res?.data;
      if (res?.status !== 200)
        throw new Error(data?.error || "Failed to fetch user");
      return data.data;
    },
    retry: false,
  });
}
