import { PrismaClient } from "@prisma/client";
import { addressHasSBT } from "helpers/contract-reads";
import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions, Session } from "./auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  switch (req.method) {
    case "POST":
      await postImageModel(req, res);
      break;

    case "GET":
      await getImageModel(req, res);
      break;

    case "DELETE":
      await deleteImageModel(req, res);
      break;

    default:
      res.status(400).json({ message: "Invalid method" });
  }
}

const postImageModel = async (
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

  const imageModel = await prisma.imageModel.create({
    data: { owner: address, state: "NEEDS_IMAGES" },
  });

  return res.status(200).json(imageModel);
};

const getImageModel = async (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => {
  const { address } = req.query;

  if (typeof address !== "string") {
    return res.status(400).json({ message: "Invalid address" });
  }

  const imageModel = await prisma.imageModel.findFirst({
    where: { owner: address },
  });

  return res.status(200).json(imageModel);
};

const deleteImageModel = async (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => {
  throw new Error("Function not implemented.");
};
