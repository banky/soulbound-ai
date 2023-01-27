import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "constants/image-upload";

export const validFileType = (file: File) =>
  ALLOWED_FILE_TYPES.includes(file.type);

export const uniqueFile = (file: File, index: number, self: File[]) => {
  const existingFileIndex = self.findIndex(({ name }) => file.name === name);
  return existingFileIndex === index;
};

export const validFileSize = (file: File) => file.size < MAX_FILE_SIZE;
