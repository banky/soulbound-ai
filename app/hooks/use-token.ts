import { deleteToken, getToken, postToken } from "helpers/api-calls";
import { useQueryClient, useQuery, useMutation } from "react-query";
import { useAccount } from "wagmi";

export const useToken = () => {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  const query = useQuery("token", async () => {
    if (address === undefined) {
      return;
    }
    const token = await getToken(address);
    return token ?? undefined;
  });

  const postTokenMutation = useMutation(postToken, {
    onSuccess: () => {
      queryClient.invalidateQueries("token");
    },
  });

  const deleteTokenMutation = useMutation(deleteToken, {
    onSuccess: () => {
      // Invalidate all the queries here since everything needs to be reset
      queryClient.invalidateQueries();
    },
  });

  return {
    token: query.data,
    updateTokenImage: (params: { orderId: string; imageIndex: number }) =>
      postTokenMutation.mutateAsync(params),
    deleteToken: () => deleteTokenMutation.mutateAsync(),
  };
};
