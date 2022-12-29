import { IMAGE_BASE_URL } from "constants/index";
import { useAccount } from "wagmi";

export const SbtImage = () => {
  const { address } = useAccount();

  if (address === undefined) {
    return null;
  }

  const imageUrl = `${IMAGE_BASE_URL}/${address}.png`;

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
