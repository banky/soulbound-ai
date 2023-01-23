import { Button } from "components/button";
import { stringifyError } from "helpers/stringify-error";
import {
  ChangeEvent,
  DragEvent,
  SetStateAction,
  MouseEvent,
  useRef,
  useState,
} from "react";
import { Arrow } from "svg/arrow";
import { Delete } from "svg/delete";
import { Server as Tray } from "svg/tray";

export const UploadImages = () => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // handle drag events
  const handleDrag = function (e: DragEvent<HTMLFormElement | HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // triggers when file is dropped
  const handleDrop = function (e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files) {
      setFiles([...files, ...Array.from(e.dataTransfer.files)]);
    }
  };

  // triggers when file is selected with click
  const handleChange = function (e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = async (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    setLoading(true);
    setError("");

    e.preventDefault();

    const formData = new FormData();
    files.forEach((file) => formData.append("media", file));

    try {
      fetch("/api/upload-images", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      const errorMessage = stringifyError(error);
      setError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <form
      id="form-file-upload"
      onDragEnter={handleDrag}
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="mx-auto max-w-4xl relative">
        <input
          ref={inputRef}
          type="file"
          id="input-file-upload"
          className="hidden"
          multiple={true}
          onChange={handleChange}
          accept=".jpg,.png"
        />
        <label
          htmlFor="input-file-upload"
          className={`p-8 h-full flex items-center justify-center border-2 rounded-2xl border-dashed border-pink-500 stroke-pink-500 ${
            dragActive ? "drag-active" : "border-pink-700 stroke-pink-700"
          }`}
        >
          <div className="flex flex-col items-center">
            {files.length > 0 ? (
              <ImagePreviews files={files} setFiles={setFiles} />
            ) : (
              <p>Upload images here</p>
            )}
            <div className="mt-8 animate-bounce">
              <Arrow />
            </div>
            <div className="rotate-180">
              <Tray />
            </div>
          </div>
        </label>
        {dragActive && (
          <div
            className="absolute top-0 bottom-0 left-0 right-0"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          ></div>
        )}
      </div>
      <Button type="submit" onClick={handleSubmit} className="my-8">
        Submit
      </Button>
    </form>
  );
};

type ImagePreviewProps = {
  files: File[];
  setFiles: (value: SetStateAction<File[]>) => void;
};

const ImagePreviews = ({ files, setFiles }: ImagePreviewProps) => {
  const removeFile = (file: File) => {
    const updatedFiles = files.filter((existingFile) => existingFile !== file);
    setFiles(updatedFiles);
  };

  return (
    <div className="grid gap-8 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
      {files.map((file) => {
        const imagePreviewUrl = URL.createObjectURL(file);
        return (
          <div className="relative" key={file.name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="w-24 rounded-md"
              src={imagePreviewUrl}
              alt={file.name}
            />
            <button
              className="absolute hover:scale-110 transition -top-2 -right-2"
              onClick={() => removeFile(file)}
            >
              <Delete />
            </button>
          </div>
        );
      })}
    </div>
  );
};
