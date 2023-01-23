import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import { SoulboundAIABI } from "contracts";
import { ethers } from "ethers";
import { useState } from "react";
import { stringifyError } from "helpers/stringify-error";
import { Button } from "components/button";

type MintProps = {
  fee: string;
  onMint: () => Promise<void>;
};

export const Mint = ({ fee, onMint }: MintProps) => {
  const contractAddress = process.env.NEXT_PUBLIC_SOULBOUND_AI_ADDRESS;
  const { address } = useAccount();

  const { config: mintConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: SoulboundAIABI.abi,
    functionName: "safeMint",
    args: [address],
    overrides: {
      value: ethers.utils.parseEther(fee),
    },
  });
  const { writeAsync: mint } = useContractWrite(mintConfig);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onClickMint = async () => {
    setLoading(true);
    setError("");

    try {
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
      {loading ? (
        <Button disabled>Loading</Button>
      ) : (
        <Button onClick={() => onClickMint()}>Mint ({fee}eth)</Button>
      )}

      {error !== "" ? (
        <p className="text-red-500 text-center mt-4">{error}</p>
      ) : null}
    </div>
  );
};
