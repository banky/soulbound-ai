import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions, Session } from "./auth/[...nextauth]";
import { addressHasSBT } from "helpers/contract-reads";

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

  const { s3Urls } = req.body;
  if (!(s3Urls instanceof Array)) {
    return res.status(400).json({ message: "Expected an array of files" });
  }

  for (let index = 0; index < s3Urls.length; index++) {
    const s3Url = s3Urls[index];

    if (typeof s3Url !== "string") {
      return res.status(400).json({ message: "Invalid s3Url" });
    }
  }

  await prisma.imageModel.update({
    where: { owner: address },
    data: {
      s3Urls: s3Urls,
      state: "NEEDS_TRAINING",
    },
  });

  return res.status(200).json({});
};
