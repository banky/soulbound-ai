import { getDalleImages } from "helpers/api-calls";
import { useQuery, useQueryClient } from "react-query";
import { useAccount } from "wagmi";

export const useDalleImages = () => {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  const query = useQuery("dalleImages", () => {
    if (address === undefined) {
      return [];
    }
    return getDalleImages(address);
  });

  return {
    dalleImages: query.data,
    invalidateDalleImages: () => queryClient.invalidateQueries("dalleImages"),
  };
};
