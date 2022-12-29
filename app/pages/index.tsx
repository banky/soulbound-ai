import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { MintButton } from "../components/mint-button";
import { Mnemonic } from "../components/mnemonic";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { GetServerSidePropsContext } from "next";
import { addressHasSBT, getFee } from "helpers/contract-reads";
import { publicKeyToMnemonic } from "helpers/public-key";
import { deleteImage, generateImages, saveImage } from "helpers/api-calls";
import { SelectImage } from "components/select-image";
import { SbtImage } from "components/sbt-image";
import { ConnectButton } from "components/connect-button";

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
  const { address } = useAccount();
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

  const initialMintState = hasSBT ? "burn" : "mint";
  const [mintState, setMintState] = useState<"mint" | "burn">(initialMintState);

  const onMint = async () => {
    if (address === undefined) {
      return;
    }

    const { prompt, imageUrls } = await generateImages(address);
    setPrompt(prompt);
    setImageUrls(imageUrls);

    // Save the first image by default since it is selected by default
    await saveImage(address, imageUrls[0]);
  };

  const onBurn = async () => {
    if (address === undefined) {
      return;
    }

    await deleteImage(address);

    setPrompt(undefined);
    setImageUrls([]);
  };

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

        <MintButton
          onMint={onMint}
          onBurn={onBurn}
          fee={fee}
          mintState={mintState}
          setMintState={setMintState}
        />

        {/* {mintState === "burn" ? <SbtImage /> : null} */}

        <SelectImage
          prompt={prompt}
          imageUrls={imageUrls}
          selectedImageIndex={selectedImageIndex}
          setSelectedImageIndex={setSelectedImageIndex}
        />
      </main>
    </>
  );
}
