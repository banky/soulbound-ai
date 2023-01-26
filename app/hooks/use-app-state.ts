import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { MintState } from "types/mint-state";
import { useAccount } from "wagmi";
import { useImageModel } from "./use-image-model";
import { useMintState } from "./use-mint-state";
import { usePrevious } from "./use-previous";
import { useToken } from "./use-token";

export enum AppState {
  Connect = "Connect",
  SignIn = "SignIn",
  Mint = "Mint",
  UploadImages = "UploadImages",
  StartTraining = "StartTraining",
  Training = "Training",
  SelectImage = "SelectImage",
  Burn = "Burn",
  Invalid = "Invalid",
}

export const useAppState = (): AppState => {
  const { isConnected, isDisconnected, address } = useAccount();
  const { status } = useSession();
  const { mintState } = useMintState();
  const { imageModel } = useImageModel();
  const { token } = useToken();
  const previousAddress = usePrevious(address);

  const signOutOnDisconnect = async () => {
    await signOut({
      redirect: false,
      callbackUrl: "/",
    });
  };

  // Sign the user out if they disconnect wallet
  useEffect(() => {
    if (isDisconnected) {
      signOutOnDisconnect();
    }
  }, [isDisconnected]);

  // Sign the user out if they switch connected account
  useEffect(() => {
    if (previousAddress !== undefined && previousAddress !== address) {
      signOutOnDisconnect();
    }
  }, [address, previousAddress]);

  if (!isConnected) {
    return AppState.Connect;
  }

  if (status !== "authenticated") {
    return AppState.SignIn;
  }

  if (mintState === MintState.Mint) {
    return AppState.Mint;
  }

  if (imageModel?.state === "NEEDS_IMAGES") {
    return AppState.UploadImages;
  }

  if (imageModel?.state === "NEEDS_TRAINING") {
    return AppState.StartTraining;
  }

  if (imageModel?.state === "IS_TRAINING") {
    return AppState.Training;
  }

  if (imageModel?.state === "READY" && token?.imageUrl === undefined) {
    return AppState.SelectImage;
  }

  if (mintState === MintState.Burn) {
    return AppState.Burn;
  }

  return AppState.Invalid;
};
