import { BigNumber, ethers } from "ethers";
import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useContractRead,
  useWaitForTransaction,
} from "wagmi";
import SoulboundAI from "contracts/SoulboundAI.sol/SoulboundAI.json";
import { SOULBOUND_AI_ADDRESS } from "constants/contract-addresses";

export const MintButton = () => {
  const contractAddress = SOULBOUND_AI_ADDRESS;
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

  const {
    data: mintResult,
    isLoading,
    isSuccess,
    writeAsync: mint,
  } = useContractWrite(mintConfig);

  const { config: burnConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: SoulboundAI.abi,
    functionName: "burn",
    enabled: !mintEnabled,
  });
  const { data: burnResult, write: burn } = useContractWrite(burnConfig);

  const { isLoading: mintLoading, isSuccess: mintSuccess } =
    useWaitForTransaction({
      hash: mintResult?.hash,
    });

  const { isLoading: burnLoading, isSuccess: burnSuccess } =
    useWaitForTransaction({
      hash: mintResult?.hash,
    });

  const onClickMint = async () => {
    await mint?.();
    console.log("minted");
  };

  if (mintLoading || burnLoading) {
    return (
      <button
        className="bg-white rounded-sm px-12 py-2 text-blue mx-auto block w-fit"
        disabled
      >
        Loading
      </button>
    );
  }

  return mintEnabled ? (
    <button
      onClick={() => onClickMint()}
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
