import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useInstitutesQuery = () => {
  return useQuery({
    queryKey: ["institutes"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/institute");
        const data = res?.data;
        if (res?.status !== 200) {
          throw new Error(
            data?.error || "Error occured while fetching institutes"
          );
        }
        return data.data;
      } catch (error) {
        console.error(`Error occured while fetching institutes: ${error}`);
        return [];
      }
    },
  });
};

export const useInstituteQuery = (instituteId, role) => {
  return useQuery({
    queryKey: ["institute", instituteId],
    queryFn: async () => {
      try {
        const res = await axios.get(
          role === "superAdmin"
            ? `/api/institute/${instituteId}`
            : `/api/institute/current/my`
        );
        const data = res?.data;
        if (res?.status !== 200)
          throw new Error(data?.error || "Failed to fetch institute");
        return data?.data;
      } catch (error) {
        console.error(`Error occured while fetching institute: ${error}`);
        return null;
      }
    },
  });
};
