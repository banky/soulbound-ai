import { useAccount } from "wagmi";
import { publicKeyToMnemonic } from "../helpers/public-key";

export const Mnemonic = ({ mnemonic }: { mnemonic: string }) => {
  return (
    <div className="text-center">
      {mnemonic.length > 0 ? (
        <div>
          <p>Your public key mnemonic is: </p>
          <p>{mnemonic}</p>
        </div>
      ) : (
        <p>Connect your wallet to continue</p>
      )}
    </div>
  );
};
