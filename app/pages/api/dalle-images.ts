import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  switch (req.method) {
    case "GET":
      await getDalleImages(req, res);
      break;

    default:
      res.status(400).json({ message: "Invalid method" });
  }
}

const getDalleImages = async (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => {
  const { address } = req.query;

  if (typeof address !== "string" || address.length === 0) {
    return res.status(400).json({ message: "Invalid address" });
  }

  const dalleImages = await prisma.dalleImage.findMany({
    where: {
      owner: address,
    },
  });

  return res.status(200).json(dalleImages);
};
