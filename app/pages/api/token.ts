import { addressHasSBT, tokenIdForAddress } from "helpers/contract-reads";
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { unstable_getServerSession } from "next-auth";
import { authOptions, Session } from "./auth/[...nextauth]";
import prisma from "db/prisma-client";

const supabase = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_KEY ?? ""
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  switch (req.method) {
    case "POST":
      await postToken(req, res);
      break;

    case "GET":
      await getToken(req, res);
      break;

    case "DELETE":
      await deleteToken(req, res);
      break;

    default:
      res.status(400).json({ message: "Invalid method" });
  }
}

const postToken = async (req: NextApiRequest, res: NextApiResponse<any>) => {
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
  const { orderId, imageIndex } = req.body;
  const hasSBT = await addressHasSBT(address);

  if (!hasSBT) {
    return res
      .status(401)
      .json({ message: "Unauthorized. User does not have a soulbound AI SBT" });
  }

  if (typeof orderId !== "string" || typeof imageIndex !== "number") {
    return res.status(400).json({
      message:
        "Invalid inputs. orderId must be a string and imageIndex must be a number",
    });
  }

  const order = await prisma.order.findUnique({
    where: {
      orderId: orderId,
    },
  });

  if (order == null) {
    return res.status(404).json({
      message: "Order with orderId not found",
    });
  }

  const imageUrl = order.imageUrls[imageIndex];

  if (imageUrl == null) {
    return res.status(404).json({
      message: "Image not found",
    });
  }

  const image = await fetch(imageUrl);
  const blob = await image.blob();
  const imagePath = `${randomUUID()}.png`;

  const { error } = await supabase.storage
    .from("images")
    .upload(imagePath, blob, {
      cacheControl: "3600",
      upsert: true,
    });

  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(imagePath);

  if (error != null) {
    return res.status(500).json({ message: "Failed to save image" });
  }

  const currentToken = await prisma.token.create({
    data: {
      owner: address,
      imagePath,
      imageUrl: publicUrl,
      name: `AI art for ${address.slice(0, 7)}`,
      description: order.prompt,
    },
  });

  await forceUpdateOpensea(address);

  return res.status(200).json(currentToken);
};

const getToken = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const { address } = req.query;

  if (typeof address !== "string") {
    return res.status(400).json({ message: "Invalid address" });
  }

  const token = await prisma.token.findUnique({ where: { owner: address } });

  return res.status(200).json(token);
};

const deleteToken = async (req: NextApiRequest, res: NextApiResponse<any>) => {
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

  if (hasSBT) {
    return res
      .status(401)
      .json({ message: "Shan't delete token for user that still has SBT" });
  }

  const token = await prisma.token.findUnique({
    where: {
      owner: address,
    },
  });

  const imagePath = token?.imagePath;

  await prisma.token.delete({
    where: {
      owner: address,
    },
  });

  await prisma.imageModel.delete({
    where: {
      owner: address,
    },
  });

  await prisma.order.deleteMany({
    where: {
      owner: address,
    },
  });

  if (imagePath == null) {
    return res.status(404).json({ message: "Could not find image to delete" });
  }

  const { error } = await supabase.storage.from("images").remove([imagePath]);

  if (error != null) {
    return res.status(500).json({ message: "Failed to delete image" });
  }

  return res.status(200).end();
};

const forceUpdateOpensea = async (address: string) => {
  const tokenId = await tokenIdForAddress(address);
  if (tokenId === undefined) {
    return;
  }

  await fetch(
    `${process.env.OPENSEA_BASE_URL}/api/v1/asset/${process.env.NEXT_PUBLIC_SOULBOUND_AI_ADDRESS}/${tokenId}/?force_update=true`
  );
};
