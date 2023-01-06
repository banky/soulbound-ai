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
  if (prompt === undefined) {
    return null;
  }

  const onClickImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  return (
    <div className="text-center my-8">
      <p>Select an image below and that is it!</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-7xl mx-auto">
        {imageUrls.map((imageUrl, index) => {
          return (
            <div className="justify-center">
              <button key={imageUrl} onClick={() => onClickImage(index)}>
                <SelectableImage
                  url={imageUrl}
                  selected={index === selectedImageIndex}
                  alt={prompt + ` . Option ${index + 1}`}
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
