import { useAccount } from "wagmi";
import { publicKeyToMnemonic } from "../helpers/public-key";

export const Mnemonic = () => {
  const { isConnected, address, status } = useAccount();

  if (status === "connecting" || status === "reconnecting")
    return (
      <div className="text-center">
        <p>Loading...</p>
        <p></p>
      </div>
    );

  return (
    <div className="text-center">
      {isConnected && address !== undefined ? (
        <div>
          <p>Your public key mnemonic is: </p>
          <p>{publicKeyToMnemonic(address)}</p>
        </div>
      ) : (
        <p>Connect your wallet to continue</p>
      )}
    </div>
  );
};
