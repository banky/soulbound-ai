import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, Files, File } from "formidable";
import { unstable_getServerSession } from "next-auth";
import { authOptions, Session } from "./auth/[...nextauth]";
import { addressHasSBT } from "helpers/contract-reads";
import fs from "fs";
import { ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE } from "constant/image-upload";
import {
  validFormidableFileSize,
  validFormidableFileType,
} from "helpers/file-list";
import prisma from "clients/prisma";

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
      await postUploadImage(req, res);
      break;

    default:
      res.status(400).json({ message: "Invalid method" });
  }
}

const postUploadImage = async (
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

  const form = new IncomingForm({ uploadDir: "/tmp" });
  const files = await new Promise<Files>((resolve, reject) => {
    form.parse(req, (err, _, files) => {
      if (err) {
        reject(err);
      }
      resolve(files);
    });
  });

  if (files.media instanceof Array) {
    return res
      .status(400)
      .json({ message: `Can only upload one file at a time` });
  }

  const file = files.media;

  if (!validFormidableFileSize(file)) {
    return res.status(400).json({
      message: `Some uploaded files are too large. Max file size is ${
        MAX_FILE_SIZE / 1_000_000
      }MB`,
    });
  }

  if (!validFormidableFileType(file)) {
    return res.status(400).json({
      message: `Some uploaded files are not valid. Valid file types are ${ALLOWED_FILE_EXTENSIONS.join(
        ", "
      )}`,
    });
  }

  const imageModel = await prisma.imageModel.findUnique({
    where: {
      owner: address,
    },
  });
  if (imageModel == null) {
    return res.status(404).json({
      message: "ImageModel not found",
    });
  }

  const { batchId } = imageModel;
  const s3Url = await uploadFile(file, batchId);
  fs.unlinkSync(file.filepath);

  await prisma.imageModel.update({
    where: { owner: address },
    data: {
      s3Urls: {
        push: s3Url,
      },
      state: "NEEDS_IMAGES",
    },
  });

  return res.status(200).json({});
};

/**
 * Upload file to neural love
 * @param file
 * @returns
 */
const uploadFile = async (file: File, batchId: string): Promise<string> => {
  if (process.env.NEURAL_LOVE_IMAGE_MODEL !== undefined) {
    await new Promise((res) => setTimeout(res, 1000));

    return `mock-image-url-1-${file.originalFilename}`;
  }

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
    // @ts-expect-error: Content length isn't typed to use a string
    headers: {
      "Content-length": fileSizeInBytes,
    },
    // @ts-expect-error: Body isn't typed to take a Readstream
    body: readStream,
  });

  if (!imageUploadResponse.ok) {
    throw new Error(`Error uploading image ${file.originalFilename}`);
  }

  return s3Url;
};
