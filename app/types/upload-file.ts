export type UploadFile = {
  name: string;
  mimeType: string;
};

export type PresignedUrl = {
  url: string;
  s3Url: string;
};
