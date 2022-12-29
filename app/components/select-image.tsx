import { saveImage } from "helpers/api-calls";
import Image from "next/image";
import { useAccount } from "wagmi";

type SelectImageProps = {
  prompt?: string;
  imageUrls: string[];
  selectedImageIndex: number;
  setSelectedImageIndex: (i: number) => void;
};

export const SelectImage = ({
  prompt,
  imageUrls,
  selectedImageIndex,
  setSelectedImageIndex,
}: SelectImageProps) => {
  const { address } = useAccount();

  if (prompt === undefined) {
    return null;
  }

  const onClickImage = (index: number) => {
    const selectedImageUrl = imageUrls[index];
    saveImage(address, selectedImageUrl);
    setSelectedImageIndex(index);
  };

  return (
    <div className="text-center mt-8">
      <div className="flex gap-4">
        {imageUrls.map((imageUrl, index) => {
          return (
            <button key={imageUrl} onClick={() => onClickImage(index)}>
              <SelectableImage
                url={imageUrl}
                selected={index === selectedImageIndex}
                alt={prompt + ` . Option ${index + 1}`}
              />
            </button>
          );
        })}
      </div>
      <p className="mt-8">{prompt}</p>
    </div>
  );
};

type SelectableImageProps = {
  url: string;
  selected: boolean;
  alt: string;
};

const SelectableImage = ({ url, selected, alt }: SelectableImageProps) => {
  return (
    <div
      className={`relative transition ${selected ? "" : "scale-90 opacity-40"}`}
    >
      <img className="rounded-md" src={url} alt={alt} />
    </div>
  );
};
