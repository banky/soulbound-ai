export const MIN_FILES = 10;
export const MAX_FILES = 69; // lol
export const MAX_FILE_SIZE = 5_000_000; // bytes
export const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg"];
export const ALLOWED_FILE_EXTENSIONS = ALLOWED_FILE_TYPES.map((fileType) =>
  fileType.replace("image/", ".")
);
