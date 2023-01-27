import { IMAGE_MODEL_REFETCH_INTERVAL } from "constants/refetch-interval";
import {
  getImageModel,
  postImageModel,
  postTrainModel,
  uploadImages,
} from "helpers/api-calls";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Descriptor } from "types/descriptor";
import { MintState } from "types/mint-state";
import { useAccount } from "wagmi";
import { useMintState } from "./use-mint-state";

export const useImageModel = () => {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { mintState } = useMintState();

  const query = useQuery(
    "imageModel",
    async () => {
      if (address === undefined) {
        return;
      }

      try {
        const imageModel = await getImageModel(address);
        return imageModel ?? undefined;
      } catch (error) {
        // Swallow these errors
      }
    },
    {
      enabled: mintState === MintState.Burn,
      refetchInterval: (imageModel) => {
        if (imageModel?.state === "IS_TRAINING") {
          // Training takes a while, so update only once per 5 mins
          return IMAGE_MODEL_REFETCH_INTERVAL;
        }
        return Infinity;
      },
    }
  );

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

  const trainModelMutation = useMutation(postTrainModel, {
    onSuccess: () => {
      queryClient.invalidateQueries("imageModel");
    },
  });

  return {
    imageModel: query.data,
    loading: query.isLoading,
    postImageModel: () => postImageModelMutation.mutateAsync(),
    uploadImages: (formData: FormData) =>
      uploadImagesMutation.mutateAsync(formData),
    trainModel: (descriptor: Descriptor) =>
      trainModelMutation.mutateAsync(descriptor),
  };
};