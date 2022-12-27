import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SOULBOUND_AI_ADDRESS } from "constants/contract-addresses";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { MintButton } from "../components/mint-button";
import { Mnemonic } from "../components/mnemonic";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { GetServerSidePropsContext } from "next";
import { addressHasSBT } from "helpers/contract-reads";
import { publicKeyToMnemonic } from "helpers/public-key";

type HomeProps = {
  hasSBT: boolean;
  mnemonic: string;
};

export const getServerSideProps = async ({
  req,
  res,
}: GetServerSidePropsContext): Promise<{ props: HomeProps }> => {
  const address = getCookie("address", { req, res })?.toString();

  if (address === undefined) {
    return {
      props: { hasSBT: false, mnemonic: "" },
    };
  }

  const hasSBT = await addressHasSBT(address);
  const mnemonic = publicKeyToMnemonic(address);

  return {
    props: { hasSBT, mnemonic },
  };
};

export default function Home({ hasSBT, mnemonic }: HomeProps) {
  const { address } = useAccount();
  const contractAddress = SOULBOUND_AI_ADDRESS;

  useEffect(() => {
    setCookie("address", address, { sameSite: "strict" });

    if (address === undefined) {
      deleteCookie("address");
    }
  }, [address]);

  return (
    <>
      <header className="flex justify-between items-center">
        <h1 className="text-3xl">soulbound ai</h1>
        <ConnectButton />
      </header>

      <main className="mt-40">
        <h2 className="text-center text-pink-500 text-7xl mb-8">
          Mint a unique SoulBound NFT using AI
        </h2>
        <div className="mb-8">
          <Mnemonic mnemonic={mnemonic} />
        </div>

        <MintButton hasSBT={hasSBT} />
      </main>
    </>
  );
}
