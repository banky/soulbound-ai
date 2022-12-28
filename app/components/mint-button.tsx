import { BigNumber, ethers } from "ethers";
import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useWaitForTransaction,
  useContractRead,
} from "wagmi";
import SoulboundAI from "contracts/artifacts/src/SoulboundAI.sol/SoulboundAI.json";
import { SOULBOUND_AI_ADDRESS } from "constants/contract-addresses";
import { Button } from "./button";
import { useState } from "react";

type MintButtonProps = {
  hasSBT: boolean;
};

export const MintButton = ({ hasSBT: initialHasSBT }: MintButtonProps) => {
  const contractAddress = SOULBOUND_AI_ADDRESS;
  const { address } = useAccount();
  const [hasSBT, setHasSBT] = useState(initialHasSBT);

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
  const { writeAsync: mint } = useContractWrite(mintConfig);

  const { config: burnConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: SoulboundAI.abi,
    functionName: "burn",
    enabled: hasSBT,
  });
  const { writeAsync: burn } = useContractWrite(burnConfig);

  const { refetch: refetchHasSBT } = useContractRead({
    address: contractAddress,
    abi: SoulboundAI.abi,
    functionName: "balanceOf",
    args: [address],
    onSuccess: (data: BigNumber) => {
      setHasSBT(data.gt(0));
    },
  });

  const [mintLoading, setMintLoading] = useState(false);
  const [burnLoading, setBurnLoading] = useState(false);

  const onClickMint = async () => {
    setMintLoading(true);

    const sendTransactionResult = await mint?.();
    await sendTransactionResult?.wait();
    await refetchHasSBT();

    setMintLoading(false);
  };

  const onClickBurn = async () => {
    setBurnLoading(true);

    const sendTransactionResult = await burn?.();
    await sendTransactionResult?.wait();
    await refetchHasSBT();

    setBurnLoading(false);
  };

  if (mintLoading || burnLoading) {
    return <Button disabled>Loading</Button>;
  }

  return hasSBT ? (
    <Button onClick={() => onClickBurn()}>Burn</Button>
  ) : (
    <Button onClick={() => onClickMint()}>Mint</Button>
  );
};
