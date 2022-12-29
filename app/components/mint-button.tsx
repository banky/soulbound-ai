import { BigNumber, ethers } from "ethers";
import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useContractRead,
} from "wagmi";
import SoulboundAI from "contracts/artifacts/src/SoulboundAI.sol/SoulboundAI.json";
import { SOULBOUND_AI_ADDRESS } from "constants/index";
import { Button } from "./button";
import { useState } from "react";

type MintState = "mint" | "burn";

type MintButtonProps = {
  fee: string;
  mintState: MintState;
  setMintState: (s: MintState) => void;
  onMint: () => Promise<void>;
  onBurn: () => Promise<void>;
};

export const MintButton = ({
  fee,
  mintState,
  setMintState,
  onMint,
  onBurn,
}: MintButtonProps) => {
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
    enabled: mintState === "mint",
  });
  const { writeAsync: mint } = useContractWrite(mintConfig);

  const { config: burnConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: SoulboundAI.abi,
    functionName: "burn",
    enabled: mintState === "burn",
  });
  const { writeAsync: burn } = useContractWrite(burnConfig);

  const { refetch: refetchHasSBT } = useContractRead({
    address: contractAddress,
    abi: SoulboundAI.abi,
    functionName: "balanceOf",
    args: [address],
    onSuccess: (data: BigNumber) => {
      if (data.gt(0)) {
        setMintState("burn");
      } else {
        setMintState("mint");
      }
    },
  });

  const [loading, setLoading] = useState(false);

  const onClickMint = async () => {
    setLoading(true);

    const sendTransactionResult = await mint?.();
    await sendTransactionResult?.wait();

    await onMint();
    await refetchHasSBT();

    setLoading(false);
  };

  const onClickBurn = async () => {
    setLoading(true);

    const sendTransactionResult = await burn?.();
    await sendTransactionResult?.wait();

    await onBurn();
    await refetchHasSBT();

    setLoading(false);
  };

  if (loading) {
    return <Button disabled>Loading</Button>;
  }

  if (mintState === "burn") {
    return <Button onClick={() => onClickBurn()}>Burn</Button>;
  }

  return <Button onClick={() => onClickMint()}>Mint ({fee}eth)</Button>;
};
