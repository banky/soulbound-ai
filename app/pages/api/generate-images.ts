import type { NextApiRequest, NextApiResponse } from "next";
import { addressHasSBT } from "helpers/contract-reads";
import { authOptions, Session } from "./auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import prisma from "clients/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  switch (req.method) {
    case "POST":
      await postGenerateImages(req, res);
      break;

    default:
      res.status(400).json({ message: "Invalid method" });
  }
}

const postGenerateImages = async (
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

  const { prompt } = req.body;

  if (typeof prompt !== "string") {
    return res.status(400).json({
      message:
        "Need to provide a descriptor for the images. Options are man, woman, other",
    });
  }

  if (!prompt.includes("@object")) {
    return res.status(400).json({
      message:
        "Please use @object in prompt to utilise custom model. Example: Renaissance portrait of @object",
    });
  }

  const imageModel = await prisma.imageModel.findUnique({
    where: {
      owner: address,
    },
  });

  if (imageModel == null || imageModel.modelId == null) {
    return res.status(404).json({
      message: "Image model not found",
    });
  }

  const { modelId } = imageModel;
  const { orderId } = await generateImages(prompt, modelId);

  const order = await prisma.order.create({
    data: {
      owner: address,
      orderId: orderId,
      imageUrls: [],
      prompt,
      ready: false,
    },
  });

  res.status(200).json(order);
};

/**
 * Generate images using neural love
 * @param prompt
 * @param modelId
 * @returns
 */
const generateImages = async (prompt: string, modelId: string) => {
  const generateBody = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEURAL_LOVE_API_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      style: "anything",
      layout: "square",
      amount: 4,
      customModelId: modelId,
    }),
  };

  const estimateImageGenerationResponse = await fetch(
    "https://api.neural.love/v1/ai-art/estimate",
    generateBody
  );

  const { price } = await estimateImageGenerationResponse.json();
  if (price.amount !== "0") {
    // Don't want to generate images if it starts costing more money
    throw new Error("Cannot generate image");
  }

  const generateImagesResponse = await fetch(
    "https://api.neural.love/v1/ai-art/generate",
    generateBody
  );

  const result = await generateImagesResponse.json();

  if (!generateImagesResponse.ok) {
    throw new Error(result.detail);
  }

  return result;
};
