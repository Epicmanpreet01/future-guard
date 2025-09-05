import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useMentorsQuery = () => {
  return useQuery({
    queryKey: ["mentors"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/user/mentor");
        const data = res?.data;
        if (res?.status !== 200)
          throw new Error(data?.error || "Failed to fetch mentors");
        return data?.data;
      } catch (error) {
        console.error(`Error occured while fetching mentors: ${error}`);
        return [];
      }
    },
  });
};

export const useMentorQuery = (mentorId) => {
  return useQuery({
    queryKey: ["mentor", mentorId],
    queryFn: async () => {
      try {
        const res = await axios.get(`/api/user/mentor/${mentorId}`);
        const data = res?.data;
        if (res?.status !== 200)
          throw new Error(data?.error || "Failed to fetch mentor");
        return data?.data;
      } catch (error) {
        console.error(`Error occured while fetching mentors: ${error}`);
        return {};
      }
    },
  });
};
