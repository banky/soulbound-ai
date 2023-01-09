import { useState } from "react";
import { useAccount } from "wagmi";
import { MintButton } from "../components/mint-button";
import { Mnemonic } from "../components/mnemonic";
import { GetServerSidePropsContext } from "next";
import { addressHasSBT, getFee } from "helpers/contract-reads";
import { publicKeyToMnemonic } from "helpers/public-key";
import { generateImages } from "helpers/api-calls";
import { SelectImage } from "components/select-image";
import { MintState } from "types/mint-state";
import { useSession } from "next-auth/react";
import { SignInButton } from "components/sign-in-button";
import { unstable_getServerSession } from "next-auth";
import { authOptions, Session } from "./api/auth/[...nextauth]";
import { useToken } from "hooks/use-token";
import { SelectImageButton } from "components/select-image-button";
import { useDalleImages } from "hooks/use-dalle-images";
import { SbtImage } from "components/sbt-image";
import { useMintState } from "hooks/use-mint-state";
import dynamic from "next/dynamic";

type HomeProps = {
  hasSBT: boolean;
  fee: string;
};

export const getServerSideProps = async ({
  req,
  res,
}: GetServerSidePropsContext): Promise<{ props: HomeProps }> => {
  const fee = await getFee();

  const session = await unstable_getServerSession<any, Session>(
    req,
    res,
    authOptions
  );

  if (session == null) {
    return {
      props: { hasSBT: false, fee },
    };
  }

  const { address } = session;
  const hasSBT = await addressHasSBT(address);

  return {
    props: { hasSBT, fee },
  };
};

const Home = ({ hasSBT, fee }: HomeProps) => {
  const { address, isConnected } = useAccount();
  const { status } = useSession();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const initialMintState = hasSBT ? MintState.BURN : MintState.MINT;
  const { mintState, refetchMintState } = useMintState(initialMintState);

  const mnemonic = address !== undefined ? publicKeyToMnemonic(address) : "";
  const { token, invalidateToken, updateTokenImage, deleteToken } = useToken();
  const { dalleImages, invalidateDalleImages } = useDalleImages();

  const needsToSelectImage =
    token !== undefined &&
    dalleImages !== undefined &&
    token.imagePath == null &&
    mintState === MintState.BURN;

  const onMint = async () => {
    if (address === undefined) {
      return;
    }

    await refetchMintState();

    await generateImages();

    // Invalidate local caches
    await invalidateDalleImages();
    await invalidateToken();
  };

  const onBurn = async () => {
    if (address === undefined) {
      return;
    }

    await refetchMintState();

    await deleteToken();

    await invalidateDalleImages();
  };

  const onSelectImage = async () => {
    await updateTokenImage(selectedImageIndex);
  };

  const loggedIn = isConnected && status === "authenticated";

  const getDisplayImage = () => {
    if (needsToSelectImage) {
      return (
        <SelectImage
          prompt={token.description}
          dalleImages={dalleImages}
          selectedImageIndex={selectedImageIndex}
          setSelectedImageIndex={setSelectedImageIndex}
        />
      );
    }

    if (mintState === MintState.BURN && token !== undefined) {
      return <SbtImage token={token} />;
    }

    return null;
  };

  const getPrimaryButton = () => {
    if (!loggedIn) {
      return <SignInButton />;
    }

    if (needsToSelectImage) {
      return <SelectImageButton onSelectImage={onSelectImage} />;
    }

    return (
      <MintButton
        onMint={onMint}
        onBurn={onBurn}
        fee={fee}
        mintState={mintState}
      />
    );
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
        <div className="mb-8">
          <Mnemonic mnemonic={mnemonic} />
        </div>

        <div className="text-center my-8">{getDisplayImage()}</div>

        {getPrimaryButton()}
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
