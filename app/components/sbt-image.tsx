import { useAccount } from "wagmi";

type SbtImageProps = {
  imageUrl: string;
};

export const SbtImage = ({ imageUrl }: SbtImageProps) => {
  return (
    <div className="mt-8 flex justify-center">
      <img
        className="rounded-md max-w-md"
        src={imageUrl}
        alt="Soul bound token AI generated image"
      />
    </div>
  );
};
