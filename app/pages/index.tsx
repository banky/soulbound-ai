import { useAccount } from "wagmi";
import { GetServerSidePropsContext } from "next";
import { getFee } from "helpers/contract-reads";
import { SelectImage } from "slots/select-image";
import { MintState } from "types/mint-state";
import { useSession } from "next-auth/react";
import { useMintState } from "hooks/use-mint-state";
import dynamic from "next/dynamic";
import { useImageModel } from "hooks/use-image-model";
import { ConnectWallet } from "slots/connect-wallet";
import { SignIn } from "slots/sign-in";
import { Mint } from "slots/mint";
import { Burn } from "slots/burn";
import { UploadImages } from "slots/upload-images";
import { StartTraining } from "slots/start-training";
import { TrainingInProgress } from "slots/training-in-progress";

type HomeProps = {
  fee: string;
};

export const getServerSideProps = async ({
  req,
  res,
}: GetServerSidePropsContext): Promise<{ props: HomeProps }> => {
  const fee = await getFee();

  return {
    props: { fee },
  };
};

enum AppState {
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

const useAppState = (): AppState => {
  const { isConnected } = useAccount();
  const { status } = useSession();
  const { mintState } = useMintState();
  const { imageModel } = useImageModel();

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

  if (imageModel?.state === "READY") {
    return AppState.SelectImage;
  }

  if (mintState === MintState.Burn) {
    return AppState.Burn;
  }

  return AppState.Invalid;
};

const Home = ({ fee }: HomeProps) => {
  const appState = useAppState();

  const { refetchMintState } = useMintState();
  const { postImageModel } = useImageModel();

  const onMint = async () => {
    await postImageModel();
    await refetchMintState();
  };

  const onBurn = async () => {
    await refetchMintState();
  };

  const getSlot = () => {
    switch (appState) {
      case AppState.Connect:
        return <ConnectWallet />;

      case AppState.SignIn:
        return <SignIn />;

      case AppState.Mint:
        return <Mint fee={fee} onMint={onMint} />;

      case AppState.Burn:
        return <Burn onBurn={onBurn} />;

      case AppState.UploadImages:
        return <UploadImages />;

      case AppState.StartTraining:
        return <StartTraining />;

      case AppState.Training:
        return <TrainingInProgress />;

      case AppState.SelectImage:
        return <SelectImage />;

      default:
        // TODO: Maybe a loading spinner
        return <div className="text-center">Loading</div>;
    }
  };

  return (
    <>
      <header className="flex justify-between items-center">
        <h1 className="text-3xl">soulbound ai</h1>
      </header>

      <main className="mt-24 md:mt-40">
        <h2 className="text-center text-pink-500 text-7xl mb-8">
          Mint a unique SoulBound NFT using AI
        </h2>

        {getSlot()}
      </main>
    </>
  );
};

/**
 * SSR doesn't work well with wagmi
 */
export default dynamic(() => Promise.resolve(Home), {
  ssr: false,
});
