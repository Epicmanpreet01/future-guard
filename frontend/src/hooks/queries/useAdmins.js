import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useAdminsQuery = () => {
  return useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/user/admin");
        const data = res?.data;
        if (res?.status !== 200)
          throw new Error(data?.error || "Failed to fetch admins");
        return data?.data;
      } catch (error) {
        console.error(`Error occured while fetching admins: ${error}`);
        return [];
      }
    },
    retry: false,
  });
};

export const useAdminQuery = (adminId) => {
  return useQuery({
    queryKey: ["admin", adminId],
    queryFn: async () => {
      try {
        const res = await axios.get(`/api/user/admin/${adminId}`);
        const data = res?.data;
        if (res?.status !== 200)
          throw new Error(data?.error || "Failed to fetch admin");
        return data?.data;
      } catch (error) {
        console.error(`Error occured while fetching admin: ${error}`);
        return {};
      }
    },
    retry: false,
  });
};
