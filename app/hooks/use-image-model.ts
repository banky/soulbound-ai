import { getImageModel } from "helpers/api-calls";
import { useQuery, useQueryClient } from "react-query";
import { useAccount } from "wagmi";

export const useImageModel = () => {
  const { address } = useAccount();

  const query = useQuery("token", async () => {
    if (address === undefined) {
      return;
    }
    const token = await getImageModel(address);
    return token ?? undefined;
  });

  return {
    imageModel: query.data,
  };
};
