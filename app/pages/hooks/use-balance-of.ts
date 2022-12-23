import { useAccount, useContractRead } from "wagmi";
import SoulboundAI from "contracts/SoulboundAI.sol/SoulboundAI.json";
import { BigNumber } from "ethers";

export const useBalanceOf = (address: string): number => {
  const contractAddress = process.env.SOULBOUND_AI_ADDRESS ?? "";
  const { data: balance, isFetched } = useContractRead({
    address: contractAddress,
    abi: SoulboundAI.abi,
    functionName: "balanceOf",
    args: [address],
  });

  if (!isFetched) return 0;

  return (balance as BigNumber).toNumber();
};
