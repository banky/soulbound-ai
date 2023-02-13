import { SelectImage } from "slots/select-image";
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
import { AppState, useAppState } from "hooks/use-app-state";
import { Description } from "slots/description";
import { GetServerSideProps } from "next";
import { ethers } from "ethers";
import { Loading } from "slots/loading";
import { addressHasSBT, getFee } from "helpers/contract-reads";

type HomeProps = {
  fee: string;
  referrer?: string;
};

export const getServerSideProps: GetServerSideProps = async (
  req
): Promise<{ props: HomeProps }> => {
  const fee = await getFee();
  const { referrer } = req.query;

  const validReferrer =
    typeof referrer === "string" &&
    ethers.utils.isAddress(referrer) &&
    (await addressHasSBT(referrer));

  if (!validReferrer) {
    return { props: { fee } };
  }

  return {
    props: {
      fee,
      referrer,
    },
  };
};

const Home = ({ fee, referrer }: HomeProps) => {
  const appState = useAppState();

  const { refetchMintState } = useMintState();
  const { postImageModel } = useImageModel();
  const { deleteToken } = useToken();

  const onMint = async () => {
    await postImageModel();

    // It takes a bit of time for transaction data to propagate
    await new Promise((res) => setTimeout(res, 2000));
    await refetchMintState();
  };

  const onBurn = async () => {
    await deleteToken();

    // It takes a bit of time for transaction data to propagate
    await new Promise((res) => setTimeout(res, 2000));
    await refetchMintState();
  };

  const getSlot = () => {
    switch (appState) {
      case AppState.Connect:
        return <ConnectWallet />;

      case AppState.SignIn:
        return <SignIn />;

      case AppState.Mint:
        return <Mint fee={fee} referrer={referrer} onMint={onMint} />;

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

      case AppState.Loading:
      default:
        return <Loading />;
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
        <h2 className="text-center text-pink-500 text-5xl md:text-7xl mb-16">
          Mint a unique SoulBound NFT using AI
        </h2>

        {getSlot()}

        {showDescription ? <Description fee={fee} /> : null}
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
