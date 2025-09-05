import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useInstituteQuery = () => {
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

export default useInstituteQuery;
