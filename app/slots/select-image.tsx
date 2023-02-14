import { Order } from "@prisma/client";
import { ButtonWithError } from "components/button-with-error";
import { Button } from "components/button";
import { SecondaryButton } from "components/secondary-button";
import { stringifyError } from "helpers/stringify-error";
import { useOrders } from "hooks/use-orders";
import { useToken } from "hooks/use-token";
import { Dispatch, SetStateAction, useState } from "react";
import { Error } from "svg/error";

type SelectedImage = {
  orderId: string;
  imageIndex: number;
};

export const SelectImage = () => {
  const [confirmImageLoading, setConfirmImageLoading] = useState(false);
  const [confirmImageError, setConfirmImageError] = useState("");

  const { orders } = useOrders();
  const { updateTokenImage } = useToken();
  const [prompt, setPrompt] = useState("");
  const [selectedImage, setSelectedImage] = useState<SelectedImage>();

  const onSelectImage = (orderId: string, imageIndex: number) => {
    setSelectedImage({ orderId, imageIndex });
  };

  const onClickConfirm = async () => {
    setConfirmImageLoading(true);
    setConfirmImageError("");

    if (selectedImage === undefined) {
      return;
    }

    try {
      await updateTokenImage(selectedImage);
      setPrompt("");
    } catch (error) {
      const errorMessage = stringifyError(error);
      setConfirmImageError(errorMessage);
    }

    setConfirmImageLoading(false);
  };

  return (
    <>
      <div className="text-center">
        <p className="mb-4">
          Enter a prompt and generate as many images as you like! Then select an
          image and click confirm below
        </p>
        <input
          className="w-full max-w-3xl p-4 rounded-md text-blue mb-4 hover:scale-105 transition"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Portrait art of @me, closeup, male | painted by Miles Aldridge"
        ></input>
        <GenerateImageButtons prompt={prompt} setPrompt={setPrompt} />
      </div>

      {orders.map((order) => (
        <Order
          key={order.orderId}
          order={order}
          selectedImage={selectedImage}
          onSelectImage={onSelectImage}
        />
      ))}

      {orders.length > 0 ? (
        <ButtonWithError
          loading={confirmImageLoading}
          error={confirmImageError}
          onClick={() => onClickConfirm()}
          disabled={selectedImage === undefined}
        >
          Confirm
        </ButtonWithError>
      ) : null}
    </>
  );
};

type OrderProps = {
  order: Order;
  selectedImage?: SelectedImage;
  onSelectImage: (orderId: string, imageIndex: number) => void;
};

const Order = ({ order, selectedImage, onSelectImage }: OrderProps) => {
  return (
    <div className="border-2 rounded-2xl border-dashed border-pink-500 p-8 my-8 max-w-6xl mx-auto">
      <p className="mb-4">Prompt: {order.prompt}</p>

      <div className="grid gap-8 grid-cols-2 md:grid-cols-4 items-center">
        {order.imageUrls.map((imageUrl, imageIndex) => {
          const selected =
            selectedImage?.orderId === order.orderId &&
            selectedImage.imageIndex === imageIndex;

          return (
            <div key={imageUrl} className="flex justify-center">
              <button onClick={() => onSelectImage(order.orderId, imageIndex)}>
                <SelectableImage
                  url={imageUrl}
                  selected={selected}
                  alt={order.prompt}
                />
              </button>
            </div>
          );
        })}

        {order.ready === false
          ? Array.from(Array(4).keys()).map((_, index) => {
              return (
                <div key={index} className="flex justify-center">
                  <LoadingImage />
                </div>
              );
            })
          : null}
      </div>

      {order.error === true ? (
        <div className="flex flex-col items-center">
          <div className="mt-4 mb-8">
            <Error />
          </div>
          <p className="text-center">
            An error occured processing this order. Please try again
          </p>
        </div>
      ) : null}
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
      <img className="w-64 rounded-lg" src={url} alt={alt} />
    </div>
  );
};

const LoadingImage = () => {
  return (
    <div
      className="
        relative 
        before:absolute before:inset-0
        before:-translate-x-full
        before:animate-[shimmer_2s_infinite]
        before:bg-gradient-to-r
        before:from-transparent before:via-white/10 before:to-transparent
        isolate
        overflow-hidden
        before:border-t before:border-rose-100/10
        w-64 aspect-square rounded-lg"
    ></div>
  );
};

type GenerateImageButtonsProps = {
  prompt: string;
  setPrompt: Dispatch<SetStateAction<string>>;
};

const GenerateImageButtons = ({
  prompt,
  setPrompt,
}: GenerateImageButtonsProps) => {
  const [generateImageLoading, setGenerateImageLoading] = useState(false);
  const [generateRandomLoading, setGenerateRandomLoading] = useState(false);
  const [error, setError] = useState("");

  const { generateImages, generateRandomImages } = useOrders();

  const onClickGenerate = async () => {
    setGenerateImageLoading(true);
    setError("");

    try {
      await generateImages(prompt);
      setPrompt("");
    } catch (error) {
      const errorMessage = stringifyError(error);
      setError(errorMessage);
    }

    setGenerateImageLoading(false);
  };

  const onClickGenerateRandom = async () => {
    setGenerateRandomLoading(true);
    setError("");

    try {
      await generateRandomImages();
    } catch (error) {
      const errorMessage = stringifyError(error);
      setError(errorMessage);
    }

    setGenerateRandomLoading(false);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-fit mx-auto">
        <Button
          disabled={prompt.length === 0}
          loading={generateImageLoading}
          onClick={() => onClickGenerate()}
        >
          Generate
        </Button>
        <SecondaryButton
          loading={generateRandomLoading}
          onClick={() => onClickGenerateRandom()}
        >
          Randomize
        </SecondaryButton>
      </div>
      {error !== "" ? (
        <p className="text-red-500 text-center mt-4">{error}</p>
      ) : null}
    </>
  );
};
