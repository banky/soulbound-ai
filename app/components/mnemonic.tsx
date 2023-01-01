export const Mnemonic = ({ mnemonic }: { mnemonic: string }) => {
  const words = mnemonic.split(" ");

  return (
    <div className="text-center">
      {mnemonic.length > 0 ? (
        <div>
          <p>Your unique seed words are: </p>
          <p className="text-pink-500">
            {words[0]}, {words[words.length - 1]}
          </p>
        </div>
      ) : (
        <p>Connect your wallet to continue</p>
      )}
    </div>
  );
};
