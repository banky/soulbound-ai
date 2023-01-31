import type { NextApiRequest, NextApiResponse } from "next";
import { addressHasSBT } from "helpers/contract-reads";
import { authOptions, Session } from "./auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prisma from "clients/prisma";
import { StockPromptClass } from "@prisma/client";
import { MAX_PENDING_ORDERS } from "constant/orders";

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

  const { prompt, negativePrompt } = await getPrompt(req, address);

  if (!prompt.includes("@object")) {
    return res.status(400).json({
      message:
        "Please use @object in prompt to utilise custom model. Example: Renaissance portrait of @object",
    });
  }

  const numPendingOrders = await prisma.order.count({
    where: {
      ready: false,
    },
  });

  if (numPendingOrders === MAX_PENDING_ORDERS) {
    return res.status(429).json({
      message: `Cannot create more than ${MAX_PENDING_ORDERS} concurrent orders. Please wait for some to complete`,
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

  if (imageModel.state !== "READY") {
    return res.status(500).json({
      message: "Image model is not ready",
    });
  }

  const { modelId } = imageModel;

  let orderId: string;
  try {
    const generated = await generateImages(modelId, prompt, negativePrompt);
    orderId = generated.orderId;
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate images",
    });
  }

  const order = await prisma.order.create({
    data: {
      owner: address,
      orderId,
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
const generateImages = async (
  modelId: string,
  prompt: string,
  negativePrompt?: string
): Promise<{
  orderId: string;
}> => {
  const generateBody = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEURAL_LOVE_API_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      negativePrompt,
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

const getPrompt = async (
  req: NextApiRequest,
  owner: string
): Promise<{
  prompt: string;
  negativePrompt?: string;
}> => {
  if (typeof req.body.prompt === "string") {
    return { prompt: req.body.prompt };
  }

  const imageModel = await prisma.imageModel.findUnique({
    where: {
      owner,
    },
  });

  if (imageModel == null) {
    throw new Error("Image model not found");
  }

  const { descriptor } = imageModel;

  if (descriptor == null) {
    throw new Error("Image model descriptor not found");
  }

  const stockPrompts = await prisma.stockPrompt.findMany({
    where: {
      class: descriptor.toUpperCase() as StockPromptClass,
    },
  });

  const randomIndex = Math.floor(Math.random() * stockPrompts.length);

  return stockPrompts[randomIndex];
};
