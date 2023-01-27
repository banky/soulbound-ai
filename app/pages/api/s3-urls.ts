import prisma from "db/prisma-client";
import { addressHasSBT } from "helpers/contract-reads";
import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions, Session } from "./auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  switch (req.method) {
    case "POST":
      await getS3Urls(req, res);
      break;

    default:
      res.status(400).json({ message: "Invalid method" });
  }
}

const getS3Urls = async (req: NextApiRequest, res: NextApiResponse<any>) => {
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

  const { files } = req.body;

  if (!(files instanceof Array)) {
    return res.status(400).json({ message: "Expected an array of files" });
  }

  for (let index = 0; index < files.length; index++) {
    const file = files[index];

    if (typeof file.name !== "string" || typeof file.mimeType !== "string") {
      return res.status(400).json({ message: "Invalid file" });
    }
  }

  const imageModel = await prisma.imageModel.findUnique({
    where: {
      owner: address,
    },
  });
  if (imageModel == null) {
    return res.status(404).json({ message: "Could not find image model" });
  }

  const { batchId } = imageModel;
  const presignedUrls = await Promise.all(
    files.map((file) => getPresignedUrl(file.name, file.mimeType, batchId))
  );

  console.log("presignedUrls", presignedUrls);

  return res.status(200).json(presignedUrls);
};

const getPresignedUrl = async (
  fileName: string,
  mimeType: string,
  batchId: string
): Promise<{
  url: string;
  s3Url: string;
}> => {
  const extension = fileName.split(".").pop() ?? "jpg";

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
        contentType: mimeType,
        batchId,
      }),
    }
  );

  return presignedUrlResponse.json();
};
