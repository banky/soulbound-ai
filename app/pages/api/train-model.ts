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
      await postTrainModel(req, res);
      break;

    default:
      res.status(400).json({ message: "Invalid method" });
  }
}

const postTrainModel = async (
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

  const { descriptor } = req.body;

  if (typeof descriptor !== "string") {
    return res.status(401).json({
      message:
        "Need to provide a descriptor for the images. Options are man, woman, other",
    });
  }

  const imageModel = await prisma.imageModel.findUnique({
    where: { owner: address },
  });

  if (imageModel == null) {
    return res.status(404).json({ message: "Image model not found" });
  }

  const { s3Urls } = imageModel;
  // const { orderId } = await trainModel(s3Urls, address, descriptor);

  const orderId = "mock-order-123";

  await prisma.imageModel.update({
    where: { owner: address },
    data: {
      orderId,
      state: "IS_TRAINING",
    },
  });
};

/**
 * Train the model with neural love
 * @param sources
 * @returns
 */
const trainModel = async (
  sources: string[],
  name: string,
  descriptor: string
) => {
  const createModelResponse = await fetch(
    "https://api.neural.love/v1/ai-art/custom-model/create",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEURAL_LOVE_API_KEY}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        class: descriptor,
        sources,
      }),
    }
  );

  return createModelResponse.json();
};
