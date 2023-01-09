import { BigNumber, ethers } from "ethers";
import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useContractRead,
} from "wagmi";
import { SoulboundAIABI } from "contracts";
import { Button } from "./button";
import { useState } from "react";
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
    abi: SoulboundAIABI.abi,
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
    abi: SoulboundAIABI.abi,
    functionName: "burn",
    enabled: mintState === MintState.BURN && isConnected,
  });
  const { writeAsync: burn } = useContractWrite(burnConfig);

  const { refetch: refetchHasSBT } = useContractRead({
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setErrorMessage = (error: unknown) => {
    if (typeof error === "string") {
      setError(error);
    } else if (error instanceof Error) {
      setError(error.message);
    }
  };

  const onClickMint = async () => {
    setLoading(true);
    setError("");

    try {
      const sendTransactionResult = await mint?.();
      await sendTransactionResult?.wait();

      await refetchHasSBT();
      await onMint();
    } catch (error) {
      setErrorMessage(error);
    }

    setLoading(false);
  };

  const onClickBurn = async () => {
    setLoading(true);
    setError("");

    try {
      const sendTransactionResult = await burn?.();
      await sendTransactionResult?.wait();

      await refetchHasSBT();
      await onBurn();
    } catch (error) {
      setErrorMessage(error);
    }

    setLoading(false);
  };

  const getButton = () => {
    if (loading) {
      return <Button disabled>Loading</Button>;
    }

    if (mintState === MintState.BURN) {
      return <Button onClick={() => onClickBurn()}>Burn</Button>;
    }

    return <Button onClick={() => onClickMint()}>Mint ({fee}eth)</Button>;
  };

  return (
    <div>
      {getButton()}

      {error !== "" ? (
        <p className="text-red-500 text-center mt-4">{error}</p>
      ) : null}
    </div>
  );
};
