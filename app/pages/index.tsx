import { useEffect, useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import { MintButton } from "../components/mint-button";
import { Mnemonic } from "../components/mnemonic";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { GetServerSidePropsContext } from "next";
import { addressHasSBT, getFee } from "helpers/contract-reads";
import { publicKeyToMnemonic } from "helpers/public-key";
import { deleteImage, generateImages, saveImage } from "helpers/api-calls";
import { SelectImage } from "components/select-image";
import { MintState } from "types/mint-state";
import { useSession } from "next-auth/react";
import { SignInButton } from "components/sign-in-button";

type HomeProps = {
  hasSBT: boolean;
  mnemonic: string;
  fee: string;
};

export const getServerSideProps = async ({
  req,
  res,
}: GetServerSidePropsContext): Promise<{ props: HomeProps }> => {
  const address = getCookie("address", { req, res })?.toString();
  const fee = await getFee();

  if (address === undefined) {
    return {
      props: { hasSBT: false, mnemonic: "", fee },
    };
  }

  const hasSBT = await addressHasSBT(address);
  const mnemonic = publicKeyToMnemonic(address);

  return {
    props: { hasSBT, mnemonic, fee },
  };
};

export default function Home({
  hasSBT,
  mnemonic: initialMnemonic,
  fee,
}: HomeProps) {
  const { address, isConnected } = useAccount();
  const { status } = useSession();
  const [mnemonic, setMnemonic] = useState(initialMnemonic);

  useEffect(() => {
    setCookie("address", address, { sameSite: "strict" });

    if (address === undefined) {
      deleteCookie("address");
      setMnemonic("");
    }

    if (address !== undefined) {
      setMnemonic(publicKeyToMnemonic(address));
    }
  }, [address]);

  const [prompt, setPrompt] = useState<string | undefined>(undefined);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const initialMintState = hasSBT ? MintState.BURN : MintState.MINT;
  const [mintState, setMintState] = useState<MintState>(initialMintState);

  const onMint = async () => {
    if (address === undefined) {
      return;
    }

    const { prompt, imageUrls } = await generateImages(address);
    setPrompt(prompt);
    setImageUrls(imageUrls);
  };

  const onBurn = async () => {
    if (address === undefined) {
      return;
    }

    await deleteImage(address);

    setPrompt(undefined);
    setImageUrls([]);
  };

  const onSelectImage = async () => {
    const selectedImageUrl = imageUrls[selectedImageIndex];
    await saveImage(address, selectedImageUrl);
  };

  const loggedIn = isConnected && status === "authenticated";

  return (
    <>
      <header className="flex justify-between items-center">
        <h1 className="text-3xl">soulbound ai</h1>
      </header>

      <main className="mt-40">
        <h2 className="text-center text-pink-500 text-7xl mb-8">
          Mint a unique SoulBound NFT using AI
        </h2>
        <div className="mb-8">
          <Mnemonic mnemonic={mnemonic} />
        </div>

        <SelectImage
          prompt={prompt}
          imageUrls={imageUrls}
          selectedImageIndex={selectedImageIndex}
          setSelectedImageIndex={setSelectedImageIndex}
        />

        <div>
          {!loggedIn ? (
            <SignInButton />
          ) : (
            <MintButton
              onMint={onMint}
              onBurn={onBurn}
              onSelectImage={onSelectImage}
              fee={fee}
              mintState={mintState}
              setMintState={setMintState}
            />
          )}
        </div>

        {/* {mintState === "burn" ? <SbtImage /> : null} */}
      </main>
    </>
  );
}
