import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { SoulboundAIABI } from "contracts";
import { BigNumber, ethers } from "ethers";
import { useState } from "react";
import { stringifyError } from "helpers/stringify-error";
import { ButtonWithError } from "components/button-with-error";

type MintProps = {
  onMint: () => Promise<void>;
  referrer?: string;
};

export const Mint = ({ referrer, onMint }: MintProps) => {
  const contractAddress = process.env.NEXT_PUBLIC_SOULBOUND_AI_ADDRESS;
  const { address } = useAccount();

  const { data: getFeeResult, isLoading: getFeeIsLoading } = useContractRead({
    address: contractAddress,
    abi: SoulboundAIABI.abi,
    functionName: "fee",
  });

  const validReferrerAddresss = ethers.utils.isAddress(referrer ?? "");
  const { data: balanceOfReferrerResult, isLoading: balanceOfIsLoading } =
    useContractRead({
      address: contractAddress,
      abi: SoulboundAIABI.abi,
      functionName: "balanceOf",
      args: [referrer],
      enabled: validReferrerAddresss,
    });

  const fee = getFeeResult as BigNumber | undefined;
  const balanceOfReferrer = balanceOfReferrerResult as BigNumber | undefined;

  const validReferral =
    validReferrerAddresss &&
    balanceOfReferrer !== undefined &&
    balanceOfReferrer.gt(0);

  const mintFunctionName = !validReferral ? "safeMint" : "safeMintWithReferral";
  const mintFunctionArgs = !validReferral ? [address] : [address, referrer];
  const prepareMintEnabled = !getFeeIsLoading && !balanceOfIsLoading;

  const { config: mintConfig, error: mintError } = usePrepareContractWrite({
    address: contractAddress,
    abi: SoulboundAIABI.abi,
    functionName: mintFunctionName,
    args: mintFunctionArgs,
    overrides: {
      value: fee,
    },
    enabled: prepareMintEnabled,
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
        loading={loading || !prepareMintEnabled}
        error={error}
        onClick={() => onClickMint()}
      >
        Mint ({ethers.utils.formatEther(fee ?? "0")} eth)
      </ButtonWithError>
    </div>
  );
};
