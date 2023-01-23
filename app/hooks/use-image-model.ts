import { getImageModel, postImageModel, uploadImages } from "helpers/api-calls";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useAccount } from "wagmi";

export const useImageModel = () => {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  const query = useQuery("imageModel", async () => {
    if (address === undefined) {
      return;
    }
    const imageModel = await getImageModel(address);
    return imageModel ?? undefined;
  });

  const postImageModelMutation = useMutation(postImageModel, {
    onSuccess: () => {
      queryClient.invalidateQueries("imageModel");
    },
  });

  const uploadImagesMutation = useMutation(uploadImages, {
    onSuccess: () => {
      queryClient.invalidateQueries("imageModel");
    },
  });

  return {
    imageModel: query.data,
    postImageModel: () => postImageModelMutation.mutateAsync(),
    uploadImages: (formData: FormData) =>
      uploadImagesMutation.mutateAsync(formData),
  };
};
