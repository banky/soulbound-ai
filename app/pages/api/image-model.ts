import { PrismaClient } from "@prisma/client";
import { IMAGE_MODEL_REFETCH_INTERVAL } from "constants/refetch-interval";
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

  const imageModel = await prisma.imageModel.findUnique({
    where: { owner: address },
  });

  if (imageModel == null) {
    return res.status(404).json({ message: "Image model not found" });
  }

  if (imageModel.state !== "IS_TRAINING") {
    return res.status(200).json(imageModel);
  }

  // Prevent polling neural-love too frequently since the rate limit is low
  const lastUpdatedAt = imageModel.updatedAt;
  if (Date.now() - lastUpdatedAt.getTime() < IMAGE_MODEL_REFETCH_INTERVAL) {
    return res.status(200).json(imageModel);
  }

  if (imageModel.modelId == null) {
    return res.status(500).json({
      message:
        "Something has gone terribly wrong. modelId does not exist but we think it is training",
    });
  }

  const isReady = await isModelReady(imageModel.modelId);

  const updatedImageModel = await prisma.imageModel.update({
    where: {
      owner: address,
    },
    data: {
      state: isReady ? "READY" : imageModel.state,
    },
  });

  return res.status(200).json(updatedImageModel);
};

/**
 * Check if the model has completed training and is ready for
 * image generation
 *
 * @param modelId
 * @returns
 */
const isModelReady = async (modelId: string) => {
  if (process.env.NEURAL_LOVE_IMAGE_MODEL !== undefined) {
    return mockIsModelReady(process.env.NEURAL_LOVE_IMAGE_MODEL);
  }

  const modelResponse = await fetch(
    `https://api.neural.love/v1/ai-art/custom-model/models/${modelId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.NEURAL_LOVE_API_KEY}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  const model = await modelResponse.json();
  const status = model.status.code;

  return status === 250;
};

/**
 * This is used to provide a realistic scenario for training time by using
 * and existing trained model. It is needed because training a real model costs
 * money
 *
 * @param existingModelId
 * @returns
 */
const mockIsModelReady = async (existingModelId: string) => {
  const imageModel = await prisma.imageModel.findUnique({
    where: {
      modelId: existingModelId,
    },
  });

  if (imageModel == null) {
    throw new Error("Image model provided in env file does not exist");
  }

  const mockTrainingTime = 10 * 60 * 1000;
  const isReady =
    Date.now() - imageModel.createdAt.getTime() > mockTrainingTime;

  return isReady;
};
