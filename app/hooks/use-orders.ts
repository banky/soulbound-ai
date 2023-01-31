import { ORDER_REFETCH_INTERVAL } from "constant/refetch-interval";
import {
  generateImages,
  generateRandomImages,
  getOrders,
} from "helpers/api-calls";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useAccount } from "wagmi";

export const useOrders = () => {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  const query = useQuery(
    "orders",
    async () => {
      if (address === undefined) {
        return;
      }

      const orders = await getOrders(address);
      return orders ?? undefined;
    },
    {
      refetchInterval: ORDER_REFETCH_INTERVAL,
    }
  );

  const postGenerateImagesMutation = useMutation(generateImages, {
    onSuccess: () => {
      queryClient.invalidateQueries("orders");
    },
  });

  const postGenerateRandomImagesMutation = useMutation(generateRandomImages, {
    onSuccess: () => {
      queryClient.invalidateQueries("orders");
    },
  });

  return {
    orders: query.data ?? [],
    generateImages: (prompt: string) =>
      postGenerateImagesMutation.mutateAsync(prompt),
    generateRandomImages: () => postGenerateRandomImagesMutation.mutateAsync(),
  };
};
