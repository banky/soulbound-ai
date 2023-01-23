import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

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
  throw new Error("Function not implemented.");
};

const getImageModel = async (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => {
  throw new Error("Function not implemented.");
};

const deleteImageModel = async (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => {
  throw new Error("Function not implemented.");
};
