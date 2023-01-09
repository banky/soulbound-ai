import { Token } from "@prisma/client";
import { useAccount } from "wagmi";

type SbtImageProps = {
  token: Token;
};

export const SbtImage = ({ token }: SbtImageProps) => {
  return (
    <div className="mt-8">
      <img
        className="rounded-md max-w-md mx-auto"
        src={token.imageUrl ?? ""}
        alt="Soul bound token AI generated image"
      />
      <p className="mt-8">{token.description}</p>
    </div>
  );
};
