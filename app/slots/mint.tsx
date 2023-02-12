import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import { SoulboundAIABI } from "contracts";
import { BigNumber, ethers } from "ethers";
import { useState } from "react";
import { stringifyError } from "helpers/stringify-error";
import { ButtonWithError } from "components/button-with-error";

type MintProps = {
  fee: string;
  referrer?: string;
  onMint: () => Promise<void>;
};

export const Mint = ({ fee, referrer, onMint }: MintProps) => {
  const contractAddress = process.env.NEXT_PUBLIC_SOULBOUND_AI_ADDRESS;
  const { address } = useAccount();

  const validReferral = referrer !== undefined;
  const mintFunctionName = !validReferral ? "safeMint" : "safeMintWithReferral";
  const mintFunctionArgs = !validReferral ? [address] : [address, referrer];

  const { config: mintConfig, error: mintError } = usePrepareContractWrite({
    address: contractAddress,
    abi: SoulboundAIABI.abi,
    functionName: mintFunctionName,
    args: mintFunctionArgs,
    overrides: {
      value: BigNumber.from(fee),
    },
  });
  const { writeAsync: mint } = useContractWrite(mintConfig);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onClickMint = async () => {
    setLoading(true);
    setError("");

    try {
      if (mintError?.message.includes("User not whitelisted")) {
        throw new Error("User not whitelisted");
      }

      const sendTransactionResult = await mint?.();
      await sendTransactionResult?.wait();

      await onMint();
    } catch (error) {
      const errorMessage = stringifyError(error);
      setError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <div>
      <ButtonWithError
        loading={loading}
        error={error}
        onClick={() => onClickMint()}
      >
        Mint ({ethers.utils.formatEther(fee)} eth)
      </ButtonWithError>
    </div>
  );
};
