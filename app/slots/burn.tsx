import { ButtonWithError } from "components/button-with-error";
import { SoulboundAIABI } from "contracts";
import { stringifyError } from "helpers/stringify-error";
import { useToken } from "hooks/use-token";
import { useState } from "react";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";

type BurnProps = {
  referralPercentage: number;
  onBurn: () => Promise<void>;
};

export const Burn = ({ referralPercentage, onBurn }: BurnProps) => {
  const { token } = useToken();
  const { address } = useAccount();
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
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-4xl mb-8">Your NFT</h2>
      <img className="rounded-lg" src={token?.imageUrl ?? ""} alt="SBT Image" />
      <p className="max-w-3xl">Prompt: {token?.description}</p>

      <div className="mb-16">
        <ButtonWithError
          loading={loading}
          error={error}
          onClick={() => onClickBurn()}
        >
          Burn
        </ButtonWithError>
      </div>

      <>
        <h2 className="text-4xl mb-8">Earn ETH!</h2>
        <p>
          Refer friends with your custom referral URL and receive{" "}
          {referralPercentage}% of the mint fees!
        </p>
        <p className="break-all text-center">
          {location.host}?referrer={address}
        </p>
      </>
    </div>
  );
};
