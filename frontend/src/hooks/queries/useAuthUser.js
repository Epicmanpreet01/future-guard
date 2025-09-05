import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function useAuthUser() {
  return useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axios("/api/auth/me");
        const data = res?.data;
        if (res?.status !== 200)
          throw new Error(data?.error || "Failed to fetch user");
        return data.data;
      } catch (error) {
        console.error(`Error occured while fetching user: ${error}`);
        return null;
      }
    },
    retry: false,
  });
}
