import { useAccount } from "wagmi";
import { getFee } from "helpers/contract-reads";
import { SelectImage } from "slots/select-image";
import { signOut } from "next-auth/react";
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
import { useToken } from "hooks/use-token";
import { useEffect } from "react";
import { AppState, useAppState } from "hooks/use-app-state";
import { Description } from "slots/description";

type HomeProps = {
  fee: string;
};

export const getServerSideProps = async (): Promise<{ props: HomeProps }> => {
  const fee = await getFee();

  return {
    props: { fee },
  };
};

const Home = ({ fee }: HomeProps) => {
  const appState = useAppState();

  const { refetchMintState } = useMintState();
  const { postImageModel } = useImageModel();
  const { deleteToken } = useToken();

  const { isDisconnected } = useAccount();

  // Sign the user out if they disconnect wallet
  useEffect(() => {
    const signOutOnDisconnect = async () => {
      await signOut({
        redirect: false,
        callbackUrl: "/",
      });
    };

    if (isDisconnected) {
      signOutOnDisconnect();
    }
  }, [isDisconnected]);

  const onMint = async () => {
    await postImageModel();
    await refetchMintState();
  };

  const onBurn = async () => {
    await deleteToken();
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
        return (
          <div className="text-center">An error occured. Unknown state :(</div>
        );
    }
  };

  const showDescription = [
    AppState.Connect,
    AppState.SignIn,
    AppState.Mint,
  ].includes(appState);

  return (
    <>
      <header className="flex justify-between items-center">
        <h1 className="text-3xl">soulbound ai</h1>
      </header>

      <main className="mt-24 md:mt-40">
        <h2 className="text-center text-pink-500 text-5xl md:text-7xl mb-32">
          Mint a unique SoulBound NFT using AI
        </h2>

        {getSlot()}

        {showDescription ? <Description /> : null}
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
