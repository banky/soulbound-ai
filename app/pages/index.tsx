import { ConnectButton } from "@rainbow-me/rainbowkit";
import dynamic from "next/dynamic";
import { useAccount } from "wagmi";
import { Mnemonic } from "./components/mnemonic";

// This is needed to prevent hydration issues since the server doesn't know when an account is connected
export const MnemonicNoSSR = dynamic(
  () => import("./components/mnemonic").then((module) => module.Mnemonic),
  {
    ssr: false,
  }
);

export default function Home() {
  const { address, status } = useAccount();

  console.log("address:", address, status);

  return (
    <>
      <header className="flex justify-between">
        <h1 className="text-3xl">soulbound ai</h1>
        <ConnectButton />
      </header>

      <main className="mt-40">
        <h2 className="text-center text-pink-500 text-7xl mb-8">
          Mint a unique SoulBound NFT using AI
        </h2>
        <div className="mb-8">
          <MnemonicNoSSR />
        </div>

        <button className="bg-white rounded-sm px-12 py-2 text-blue mx-auto block w-fit">
          Mint
        </button>
      </main>
    </>
  );
}
