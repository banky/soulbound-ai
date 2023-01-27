import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, Files, File } from "formidable";
import { unstable_getServerSession } from "next-auth";
import { authOptions, Session } from "./auth/[...nextauth]";
import { addressHasSBT } from "helpers/contract-reads";
import fs from "fs";
import {
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILES,
  MAX_FILE_SIZE,
  MIN_FILES,
} from "constants/image-upload";
import {
  uniqueFormidableFile,
  validFormidableFileSize,
  validFormidableFileType,
} from "helpers/file-list";
import { randomUUID } from "crypto";
import prisma from "db/prisma-client";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  switch (req.method) {
    case "POST":
      await postUploadImages(req, res);
      break;

    default:
      res.status(400).json({ message: "Invalid method" });
  }
}

const postUploadImages = async (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => {
  const session = await unstable_getServerSession<any, Session>(
    req,
    res,
    authOptions
  );

  if (session == null) {
    return res
      .status(401)
      .json({ message: "Unauthorized. User is not logged in" });
  }

  const { address } = session;
  const hasSBT = await addressHasSBT(address);

  if (!hasSBT) {
    return res
      .status(401)
      .json({ message: "Unauthorized. User does not have a soulbound AI SBT" });
  }

  const form = new IncomingForm({ multiples: true, uploadDir: "/tmp" });
  const files = await new Promise<Files>((resolve, reject) => {
    form.parse(req, (err, _, files) => {
      if (err) {
        reject(err);
      }
      resolve(files);
    });
  });

  if (!(files.media instanceof Array) || files.media.length < MIN_FILES) {
    return res
      .status(400)
      .json({ message: `Expected at least ${MIN_FILES} files` });
  }

  if (files.media.length > MAX_FILES) {
    return res
      .status(400)
      .json({ message: `Cannot upload more than ${MAX_FILES} files` });
  }

  const allFilesValidSize = files.media.every(validFormidableFileSize);

  if (!allFilesValidSize) {
    return res.status(400).json({
      message: `Some uploaded files are too large. Max file size is ${
        MAX_FILE_SIZE / 1_000_000
      }MB`,
    });
  }

  const allFilesAllowed = files.media.every(validFormidableFileType);

  if (!allFilesAllowed) {
    return res.status(400).json({
      message: `Some uploaded files are not valid. Valid file types are ${ALLOWED_FILE_EXTENSIONS.join(
        ", "
      )}`,
    });
  }

  const allFilesUnique = files.media.every(uniqueFormidableFile);

  if (!allFilesUnique) {
    return res.status(400).json({
      message: `Cannot upload duplicate files`,
    });
  }

  const s3Urls = await uploadFiles(files.media);

  await prisma.imageModel.update({
    where: { owner: address },
    data: {
      s3Urls: s3Urls,
      state: "NEEDS_TRAINING",
    },
  });

  return res.status(200).json({});
};

/**
 * Upload the list of files to s3 for neural-love
 * @param files
 */
const uploadFiles = async (files: File[]) => {
  // No need to upload images if
  if (process.env.NEURAL_LOVE_IMAGE_MODEL !== undefined) {
    await new Promise((res) => setTimeout(res, 2000));

    return ["mock-image-url-1", "mock-image-url-2", "mock-image-url-3"];
  }

  // The batchId can only contain letters and numbers
  const batchId = randomUUID().replaceAll("-", "");
  const s3Urls = await Promise.all(
    files.map((persistentFile) => uploadFile(persistentFile, batchId))
  );

  return s3Urls;
};

/**
 * Upload file to neural love
 * @param file
 * @returns
 */
const uploadFile = async (file: File, batchId: string): Promise<string> => {
  const extension = file.originalFilename?.split(".").pop() ?? "jpg";

  const presignedUrlResponse = await fetch(
    "https://api.neural.love/v1/upload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEURAL_LOVE_API_KEY}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        extension,
        contentType: file.mimetype,
        batchId,
      }),
    }
  );

  const { url, s3Url } = await presignedUrlResponse.json();

  const filePath = file.filepath;
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;

  const readStream = fs.createReadStream(filePath);

  const imageUploadResponse = await fetch(url, {
    method: "PUT",
    // @ts-expect-error
    headers: {
      "Content-length": fileSizeInBytes,
    },
    // @ts-expect-error
    body: readStream,
  });

  if (!imageUploadResponse.ok) throw new Error("Error uploading image");

  return s3Url;
};
