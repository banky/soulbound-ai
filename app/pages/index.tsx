import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { MintButton } from "../components/mint-button";
import { Mnemonic } from "../components/mnemonic";

export default function Home() {
  const { address } = useAccount();
  const contractAddress = process.env.NEXT_PUBLIC_SOULBOUND_AI_ADDRESS ?? "";

  // console.log("isFetched", isFetched);

  // const { config: mintConfig } = usePrepareContractWrite({
  //   address: contractAddress,
  //   abi: SoulboundAI.abi,
  //   functionName: "safeMint",
  //   args: [address],
  //   overrides: {
  //     value: ethers.utils.parseEther("0.01"),
  //   },
  // });
  // const {
  //   data,
  //   isLoading,
  //   isSuccess,
  //   write: mint,
  // } = useContractWrite(mintConfig);

  // const { config: burnConfig } = usePrepareContractWrite({
  //   address: contractAddress,
  //   abi: SoulboundAI.abi,
  //   functionName: "burn",
  // });
  // const { write: burn } = useContractWrite(burnConfig);

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
          <Mnemonic />
        </div>

        <MintButton />
      </main>
    </>
  );
}
