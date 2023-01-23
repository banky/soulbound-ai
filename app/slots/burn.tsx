import { Button } from "components/button";
import { SoulboundAIABI } from "contracts";
import { stringifyError } from "helpers/stringify-error";
import { useState } from "react";
import { useContractWrite, usePrepareContractWrite } from "wagmi";

type BurnProps = {
  onBurn: () => Promise<void>;
};

export const Burn = ({ onBurn }: BurnProps) => {
  const contractAddress = process.env.NEXT_PUBLIC_SOULBOUND_AI_ADDRESS;

  const { config: burnConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: SoulboundAIABI.abi,
    functionName: "burn",
  });
  const { writeAsync: burn } = useContractWrite(burnConfig);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onClickBurn = async () => {
    setLoading(true);
    setError("");

    try {
      const sendTransactionResult = await burn?.();
      await sendTransactionResult?.wait();

      await onBurn();
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
        <Button onClick={() => onClickBurn()}>Burn</Button>
      )}

      {error !== "" ? (
        <p className="text-red-500 text-center mt-4">{error}</p>
      ) : null}
    </div>
  );
};
