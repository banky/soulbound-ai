import { ALLOWED_FILE_TYPES } from "constants/image-upload";
import { File as FormidableFile } from "formidable";

export const validFileType = (file: File) =>
  ALLOWED_FILE_TYPES.includes(file.type);

export const uniqueFile = (file: File, index: number, self: File[]) => {
  const existingFileIndex = self.findIndex(({ name }) => file.name === name);
  return existingFileIndex === index;
};

export const validFormidableFileType = (file: FormidableFile) =>
  ALLOWED_FILE_TYPES.includes(file.mimetype ?? "");

export const uniqueFormidableFile = (
  file: FormidableFile,
  index: number,
  self: FormidableFile[]
) => {
  const existingFileIndex = self.findIndex(
    ({ originalFilename }) => file.originalFilename === originalFilename
  );
  return existingFileIndex === index;
};
