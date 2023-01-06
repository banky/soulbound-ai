import { BigNumber, ethers } from "ethers";
import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useContractRead,
} from "wagmi";
import SoulboundAI from "contracts/artifacts/src/SoulboundAI.sol/SoulboundAI.json";
import { Button } from "./button";
import { useState } from "react";
import { ConnectButton } from "./connect-button";
import { MintState } from "types/mint-state";

type MintButtonProps = {
  fee: string;
  mintState: MintState;
  setMintState: (s: MintState) => void;
  onMint: () => Promise<void>;
  onBurn: () => Promise<void>;
  onSelectImage: () => Promise<void>;
};

export const MintButton = ({
  fee,
  mintState,
  setMintState,
  onMint,
  onBurn,
  onSelectImage,
}: MintButtonProps) => {
  const contractAddress = process.env.NEXT_PUBLIC_SOULBOUND_AI_ADDRESS;
  const { address, isConnected } = useAccount();

  const { config: mintConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: SoulboundAI.abi,
    functionName: "safeMint",
    args: [address],
    overrides: {
      value: ethers.utils.parseEther(fee),
    },
    enabled: mintState === MintState.MINT && isConnected,
  });
  const { writeAsync: mint } = useContractWrite(mintConfig);

  const { config: burnConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: SoulboundAI.abi,
    functionName: "burn",
    enabled: mintState === MintState.BURN && isConnected,
  });
  const { writeAsync: burn } = useContractWrite(burnConfig);

  const { refetch: refetchHasSBT } = useContractRead({
    address: contractAddress,
    abi: SoulboundAI.abi,
    functionName: "balanceOf",
    args: [address],
    enabled: isConnected,
    onSuccess: (data: BigNumber) => {
      if (data.gt(0)) {
        setMintState(MintState.BURN);
      } else {
        setMintState(MintState.MINT);
      }
    },
  });

  const [loading, setLoading] = useState(false);

  const onClickMint = async () => {
    setLoading(true);

    const sendTransactionResult = await mint?.();
    await sendTransactionResult?.wait();
    await onMint();

    setMintState(MintState.SELECT_IMAGE);
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

  const onClickSelectImage = async () => {
    setLoading(true);

    await onSelectImage();

    setLoading(false);
  };

  if (loading) {
    return <Button disabled>Loading</Button>;
  }

  if (mintState === MintState.BURN) {
    return <Button onClick={() => onClickBurn()}>Burn</Button>;
  }

  if (mintState === MintState.SELECT_IMAGE) {
    return <Button onClick={() => onClickSelectImage()}>Select Image</Button>;
  }

  return <Button onClick={() => onClickMint()}>Mint ({fee}eth)</Button>;
};
