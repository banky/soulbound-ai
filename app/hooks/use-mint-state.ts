import { useState } from "react";
import { MintState } from "types/mint-state";
import { useAccount, useContractRead } from "wagmi";
import { SoulboundAIABI } from "contracts";
import { BigNumber } from "ethers";

export const useMintState = () => {
  const contractAddress = process.env.NEXT_PUBLIC_SOULBOUND_AI_ADDRESS;
  const { address, isConnected } = useAccount();

  const [mintState, setMintState] = useState(MintState.Mint);

  const { refetch: refetchMintState } = useContractRead({
    address: contractAddress,
    abi: SoulboundAIABI.abi,
    functionName: "balanceOf",
    args: [address],
    enabled: isConnected,
    onSuccess: (numTokens: BigNumber) => {
      if (numTokens.gt(0)) {
        setMintState(MintState.Burn);
      } else {
        setMintState(MintState.Mint);
      }
    },
  });

  return {
    mintState,
    refetchMintState,
  };
};
