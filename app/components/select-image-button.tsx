import { useState } from "react";
import { Button } from "./button";

type SelectImageButtonProps = {
  onSelectImage: () => Promise<void>;
};

export const SelectImageButton = ({
  onSelectImage,
}: SelectImageButtonProps) => {
  const [loading, setLoading] = useState(false);

  const onClickSelectImage = async () => {
    setLoading(true);

    try {
      await onSelectImage();
    } catch (error) {
      console.log("error selecting image");
    }

    setLoading(false);
  };

  if (loading) {
    return <Button disabled>Loading</Button>;
  }

  return <Button onClick={() => onClickSelectImage()}>Select Image</Button>;
};
