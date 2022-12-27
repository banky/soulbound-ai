import { ethers } from "ethers";
import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useWaitForTransaction,
} from "wagmi";
import SoulboundAI from "contracts/artifacts/src/SoulboundAI.sol/SoulboundAI.json";
import { SOULBOUND_AI_ADDRESS } from "constants/contract-addresses";
import { Button } from "./button";

type MintButtonProps = {
  hasSBT: boolean;
};

export const MintButton = ({ hasSBT }: MintButtonProps) => {
  const contractAddress = SOULBOUND_AI_ADDRESS;
  const { address } = useAccount();

  const { config: mintConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: SoulboundAI.abi,
    functionName: "safeMint",
    args: [address],
    overrides: {
      value: ethers.utils.parseEther("0.01"),
    },
    enabled: !hasSBT,
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
    enabled: hasSBT,
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
    return <Button disabled>Loading</Button>;
  }

  return !hasSBT ? (
    <Button onClick={() => onClickMint()}>Mint</Button>
  ) : (
    <Button onClick={() => burn?.()}>Burn</Button>
  );
};
