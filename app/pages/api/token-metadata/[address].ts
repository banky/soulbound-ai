import { NextApiRequest, NextApiResponse } from "next";
import prisma from "db/prisma-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  switch (req.method) {
    case "GET":
      await getTokenMetadata(req, res);
      break;

    default:
      res.status(400).json({ message: "Invalid method" });
  }
}

const getTokenMetadata = async (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => {
  const { address } = req.query;

  if (typeof address !== "string" || address.length === 0) {
    return res.status(401).json({ message: "Invalid address" });
  }

  const token = await prisma.token.findUnique({
    where: {
      owner: address,
    },
  });

  if (token === null) {
    return res.status(404).end();
  }

  // Follow Opensea metadata standards: https://docs.opensea.io/docs/metadata-standards
  const metadata = {
    image: token.imageUrl,
    description: token.description,
    name: token.name,
    background_color: "182F69",
  };

  return res.status(200).json(metadata);
};
