import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useAggregationsQuery = ({ role }) => {
  return useQuery({
    queryKey: ["aggregations", role],
    queryFn: async () => {
      try {
        const res = await axios.get(`/api/aggregation/${role}/stats`);
        const data = res?.data;
        if (res?.status !== 200)
          throw new Error(data?.error || "Failed to fetch aggregations");
        return data.data;
      } catch (error) {
        console.error(
          `Error occured while fetching aggregations for role: ${role}, error: ${error}`
        );
        return {};
      }
    },
  });
};

export default useAggregationsQuery;
