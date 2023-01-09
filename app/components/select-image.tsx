import { DalleImage } from "@prisma/client";

type SelectImageProps = {
  prompt?: string;
  dalleImages: DalleImage[];
  selectedImageIndex: number;
  setSelectedImageIndex: (i: number) => void;
};

export const SelectImage = ({
  prompt,
  dalleImages,
  selectedImageIndex,
  setSelectedImageIndex,
}: SelectImageProps) => {
  const onClickImage = (index: number) => {
    console.log("selected image index:", index);
    setSelectedImageIndex(index);
  };

  return (
    <div className="text-center my-8">
      <p>Select an image below and that is it!</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-7xl mx-auto">
        {dalleImages.map(({ imageIndex, imageUrl }) => {
          return (
            <div className="justify-center">
              <button key={imageUrl} onClick={() => onClickImage(imageIndex)}>
                <SelectableImage
                  url={imageUrl}
                  selected={imageIndex === selectedImageIndex}
                  alt={prompt + ` . Option ${imageIndex + 1}`}
                />
              </button>
            </div>
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
