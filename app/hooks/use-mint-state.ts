import { useState } from "react";
import { MintState } from "types/mint-state";
import { useAccount, useContractRead } from "wagmi";
import { SoulboundAIABI } from "contracts";
import { BigNumber } from "ethers";

export const useMintState = (initialMintState: MintState) => {
  const contractAddress = process.env.NEXT_PUBLIC_SOULBOUND_AI_ADDRESS;
  const { address, isConnected } = useAccount();

  const [mintState, setMintState] = useState<MintState>(initialMintState);

  const { refetch: refetchMintState } = useContractRead({
    address: contractAddress,
    abi: SoulboundAIABI.abi,
    functionName: "balanceOf",
    args: [address],
    enabled: isConnected,
    onSuccess: (numTokens: BigNumber) => {
      if (numTokens.gt(0)) {
        setMintState(MintState.BURN);
      } else {
        setMintState(MintState.MINT);
      }
    },
  });

  return {
    mintState,
    refetchMintState,
  };
};
