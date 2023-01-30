import { ActiveButton } from "components/active-button";
import { stringifyError } from "helpers/stringify-error";
import { useImageModel } from "hooks/use-image-model";
import { useState } from "react";
import { Descriptor, descriptors } from "types/descriptor";

export const StartTraining = () => {
  const [descriptor, setDescriptor] = useState<Descriptor>("woman");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { trainModel } = useImageModel();

  const onSubmit = async () => {
    setLoading(true);

    try {
      await trainModel(descriptor);
    } catch (error) {
      const errorMessage = stringifyError(error);
      setError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <div className="text-center">
      <p>
        We will now tran an AI model on your images. This takes about 90 minutes
      </p>
      <label htmlFor="descriptor">Select a description for the subject</label>

      <div className="my-4">
        <select
          name="descriptor"
          id="descriptor"
          className="bg-white text-blue w-32 p-4 rounded-md hover:scale-105 transition"
          value={descriptor}
          onChange={(e) => setDescriptor(e.target.value as Descriptor)}
        >
          {descriptors.map((descriptor) => (
            <option key={descriptor} value={descriptor}>
              {descriptor}
            </option>
          ))}
        </select>
      </div>

      <ActiveButton loading={loading} error={error} onClick={() => onSubmit()}>
        Train Model
      </ActiveButton>
    </div>
  );
};
