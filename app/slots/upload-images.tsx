import { ActiveButton } from "components/active-button";
import {
  ALLOWED_FILE_EXTENSIONS,
  ALLOWED_FILE_TYPES,
  MAX_FILES,
  MAX_FILE_SIZE,
  MIN_FILES,
} from "constants/image-upload";
import { uniqueFile, validFileSize, validFileType } from "helpers/file-list";
import { stringifyError } from "helpers/stringify-error";
import { useImageModel } from "hooks/use-image-model";
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
import { Tray } from "svg/tray";

export const UploadImages = () => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { uploadImages } = useImageModel();

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

  const addFiles = (fileList: FileList) => {
    setError("");

    const fileArray = Array.from(fileList);
    const updatedFiles = [...files, ...fileArray];

    const allFilesUnique = updatedFiles.every(uniqueFile);
    const allFilesValid = updatedFiles.every(validFileType);
    const tooManyFiles = updatedFiles.length > MAX_FILES;
    const allFilesSmallEnough = updatedFiles.every(validFileSize);

    if (tooManyFiles) {
      setError(`Cannot upload more than ${MAX_FILES} files`);
    } else if (!allFilesSmallEnough) {
      setError(
        `Cannot upload files larger than ${MAX_FILE_SIZE / 1_000_000}MB`
      );
    } else if (!allFilesUnique) {
      setError(`A selected file was already selected previously`);
    } else if (!allFilesValid) {
      setError(
        `Some selected files are not valid image files. Accepted image file types: ${ALLOWED_FILE_EXTENSIONS.join(
          ", "
        )}`
      );
    }

    const validFiles = updatedFiles
      .filter(validFileType)
      .filter(uniqueFile)
      .filter(validFileSize)
      .slice(0, MAX_FILES);

    setFiles(validFiles);
  };

  // triggers when file is dropped
  const handleDrop = function (e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  // triggers when file is selected with click
  const handleChange = function (e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      addFiles(e.target.files);
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
      await uploadImages(formData);
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
          accept={ALLOWED_FILE_TYPES.join(", ")}
        />
        <label
          htmlFor="input-file-upload"
          className={`p-8 h-full flex items-center justify-center border-2 rounded-2xl border-dashed border-pink-500 stroke-pink-500 ${
            dragActive ? "drag-active" : "border-pink-700 stroke-pink-700"
          }`}
        >
          <div className="flex flex-col items-center">
            <p className="text-center mb-8">
              Click or drag here to upload 10 or more selfies from different
              angles and a neutral background. We delete them after 24 hours
            </p>

            {files.length > 0 ? (
              <ImagePreviews files={files} setFiles={setFiles} />
            ) : null}
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
      <ActiveButton
        loading={loading}
        error={error}
        type="submit"
        onClick={handleSubmit}
        className="my-8"
        disabled={files.length < MIN_FILES}
      >
        Submit
      </ActiveButton>
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
