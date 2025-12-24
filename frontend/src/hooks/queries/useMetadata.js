import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useMetaData = () => {
  return useQuery({
    queryKey: ["metadata"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/metadata");
        const data = res?.data;
        if (res?.status !== 200)
          throw new Error(data?.error || "Failed to fetch metadata");
        return data?.data;
      } catch (error) {
        console.error(`Error occured while fetching metadata: ${error}`);
        return [];
      }
    },
  });
};

export default useMetaData;
