import { deleteToken, getToken, postToken } from "helpers/api-calls";
import { useQueryClient, useQuery, useMutation } from "react-query";
import { useAccount } from "wagmi";

export const useToken = () => {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  const query = useQuery("token", () => {
    if (address === undefined) {
      return;
    }
    return getToken(address);
  });

  const postTokenMutation = useMutation(postToken, {
    onSuccess: () => {
      queryClient.invalidateQueries("token");
    },
  });

  const deleteTokenMutation = useMutation(deleteToken, {
    onSuccess: () => {
      queryClient.invalidateQueries("token");
    },
  });

  return {
    token: query.data,
    invalidateToken: () => queryClient.invalidateQueries("token"),
    updateTokenImage: (imageIndex: number) =>
      postTokenMutation.mutateAsync(imageIndex),
    deleteToken: () => deleteTokenMutation.mutateAsync(),
  };
};
