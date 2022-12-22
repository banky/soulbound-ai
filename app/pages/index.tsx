import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import dynamic from "next/dynamic";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import SoulboundAI from "../../out/SoulboundAI.sol/SoulboundAI.json";

// This is needed to prevent hydration issues since the server doesn't know when an account is connected
export const MnemonicNoSSR = dynamic(
  () => import("./components/mnemonic").then((module) => module.Mnemonic),
  {
    ssr: false,
  }
);

export default function Home() {
  const contractAddress = "0x5fc8d32690cc91d4c39d9d3abcbd16989f875707";
  const { address } = useAccount();
  const { data: balance } = useContractRead({
    address: contractAddress,
    abi: SoulboundAI.abi,
    functionName: "balanceOf",
    args: [address],
  });

  const { config: mintConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: SoulboundAI.abi,
    functionName: "safeMint",
    args: [address],
    overrides: {
      value: ethers.utils.parseEther("0.01"),
    },
  });
  const {
    data,
    isLoading,
    isSuccess,
    write: mint,
  } = useContractWrite(mintConfig);

  const { config: burnConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: SoulboundAI.abi,
    functionName: "burn",
  });
  const { write: burn } = useContractWrite(burnConfig);

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

        <button
          onClick={() => mint?.()}
          className="bg-white rounded-sm px-12 py-2 text-blue mx-auto block w-fit"
        >
          Mint
        </button>

        <button
          onClick={() => burn?.()}
          className="bg-white rounded-sm px-12 py-2 text-blue mx-auto block w-fit"
        >
          Burn
        </button>
      </main>
    </>
  );
}
