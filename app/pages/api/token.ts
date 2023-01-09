import { addressHasSBT } from "helpers/contract-reads";
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { unstable_getServerSession } from "next-auth";
import { authOptions, Session } from "./auth/[...nextauth]";

const supabase = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_KEY ?? ""
);

const prisma = new PrismaClient();

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
  const { imageIndex } = req.body;
  const hasSBT = await addressHasSBT(address);

  if (!hasSBT) {
    return res
      .status(401)
      .json({ message: "Unauthorized. User does not have a soulbound AI SBT" });
  }

  const dalleImage = await prisma.dalleImage.findFirst({
    where: {
      owner: address,
      imageIndex: imageIndex,
    },
  });

  if (dalleImage === null) {
    return res.status(400).json({ message: "Image index not found for user" });
  }

  const dalleImageUrl = dalleImage.imageUrl;

  const image = await fetch(dalleImageUrl);
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

  const currentToken = await prisma.token.update({
    where: { owner: address },
    data: {
      imagePath,
      imageUrl: publicUrl,
    },
  });

  return res.status(200).json(currentToken);
};

const getToken = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const { address } = req.query;

  if (typeof address !== "string") {
    return res.status(400).json({ message: "Invalid address" });
  }

  const token = await prisma.token.findFirst({ where: { owner: address } });

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

  await prisma.dalleImage.deleteMany({
    where: {
      owner: address,
    },
  });

  await prisma.token.delete({
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
