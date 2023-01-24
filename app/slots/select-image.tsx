import { ActiveButton } from "components/active-button";
import { stringifyError } from "helpers/stringify-error";
import { useOrders } from "hooks/use-orders";
import { useState } from "react";

type SelectImageProps = {};

export const SelectImage = ({}: SelectImageProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { orders, generateImages } = useOrders();
  const [prompt, setPrompt] = useState("");

  const onClickGenerate = async () => {
    setLoading(true);

    try {
      await generateImages(prompt);
    } catch (error) {
      const errorMessage = stringifyError(error);
      setError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <>
      <p>Enter an image generation prompt</p>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Portrait art of @object, closeup, male | painted by Miles Aldridge"
      ></input>
      <ActiveButton
        loading={loading}
        error={error}
        onClick={() => onClickGenerate()}
        disabled={prompt.length === 0}
      >
        Generate
      </ActiveButton>

      <div>
        {orders.map((order) => {
          return (
            <div key={order.orderId}>
              <p>Prompt: {order.prompt}</p>

              <div className="grid grid-cols-4">
                {order.imageUrls.map((imageUrl) => {
                  return (
                    /* eslint-disable-next-line @next/next/no-img-element*/
                    <img key={imageUrl} src={imageUrl} alt={order.prompt}></img>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
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
