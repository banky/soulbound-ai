import { BigNumber, ethers } from "ethers";
import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useContractRead,
} from "wagmi";
import SoulboundAI from "contracts/SoulboundAI.sol/SoulboundAI.json";

export const MintButton = () => {
  const contractAddress = process.env.NEXT_PUBLIC_SOULBOUND_AI_ADDRESS ?? "";
  const { address } = useAccount();
  const {
    data: balance,
    isFetched: fetchingBalance,
    refetch,
  } = useContractRead({
    address: contractAddress,
    abi: SoulboundAI.abi,
    functionName: "balanceOf",
    args: [address],
  });

  const mintEnabled = balance !== undefined && (balance as BigNumber).eq(0);
  const { config: mintConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: SoulboundAI.abi,
    functionName: "safeMint",
    args: [address],
    overrides: {
      value: ethers.utils.parseEther("0.01"),
    },
    enabled: mintEnabled,
  });

  const { config: burnConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: SoulboundAI.abi,
    functionName: "burn",
    enabled: !mintEnabled,
  });
  const { write: burn } = useContractWrite(burnConfig);

  const {
    data,
    isLoading,
    isSuccess,
    write: mint,
  } = useContractWrite(mintConfig);

  return mintEnabled ? (
    <button
      onClick={() => mint?.()}
      className="bg-white rounded-sm px-12 py-2 text-blue mx-auto block w-fit"
    >
      Mint
    </button>
  ) : (
    <button
      onClick={() => burn?.()}
      className="bg-white rounded-sm px-12 py-2 text-blue mx-auto block w-fit"
    >
      Burn
    </button>
  );
};
