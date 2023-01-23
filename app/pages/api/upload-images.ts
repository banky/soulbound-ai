import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, Files, File } from "formidable";
import { unstable_getServerSession } from "next-auth";
import { authOptions, Session } from "./auth/[...nextauth]";
import { addressHasSBT } from "helpers/contract-reads";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

export const config = {
  api: {
    bodyParser: false,
  },
};

const MIN_FILES = 2;
const prisma = new PrismaClient();

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

  const form = new IncomingForm({ multiples: true });
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
      .status(401)
      .json({ message: `Expected at least ${MIN_FILES} files` });
  }

  const s3Urls = await Promise.all(
    files.media.map((persistentFile) => uploadFile(persistentFile, address))
  );

  await prisma.imageModel.update({
    where: { owner: address },
    data: {
      s3Urls: s3Urls,
      state: "NEEDS_TRAINING",
    },
  });

  return res.status(200);
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
