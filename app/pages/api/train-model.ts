import { randomUUID } from "crypto";
import { addressHasSBT } from "helpers/contract-reads";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import prisma from "clients/prisma";
import { authOptions, Session } from "./auth/[...nextauth]";
import { Descriptor, descriptors } from "types/descriptor";

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
  const session = await getServerSession<any, Session>(req, res, authOptions);

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

  if (
    typeof descriptor !== "string" ||
    !descriptors.includes(descriptor as Descriptor)
  ) {
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

  if (imageModel.state !== "NEEDS_TRAINING") {
    return res.status(500).json({
      message: "Refusing to train. This model is not in the right state",
    });
  }

  const { s3Urls } = imageModel;
  const name = randomUUID();

  const { orderId } = await trainModel(s3Urls, name, descriptor);

  await prisma.imageModel.update({
    where: { owner: address },
    data: {
      modelId: orderId,
      state: "IS_TRAINING",
      descriptor,
    },
  });

  return res.status(200).json({});
};

/**
 * Train the model with neural love
 * @param sources
 * @param name
 * @param descriptor
 * @returns
 */
const trainModel = async (
  sources: string[],
  name: string,
  descriptor: string
): Promise<{ orderId: string }> => {
  if (process.env.NEURAL_LOVE_IMAGE_MODEL !== undefined) {
    return { orderId: process.env.NEURAL_LOVE_IMAGE_MODEL };
  }

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

  const result = await createModelResponse.json();

  if (!createModelResponse.ok) {
    throw new Error(result.detail);
  }

  return result;
};
