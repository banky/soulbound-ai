import { addressHasSBT } from "helpers/contract-reads";
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { unstable_getServerSession } from "next-auth";
import { authOptions, Session } from "./auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== "POST") {
    return res.status(400).json({ message: "Invalid method" });
  }

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

  const supabase = createClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_KEY ?? ""
  );

  const prisma = new PrismaClient();
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

  if (error != null) {
    return res.status(500).json({ message: "Failed to save image" });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(imagePath);

  const currentToken = await prisma.token.update({
    where: { owner: address },
    data: {
      imageUrl: publicUrl,
    },
  });

  return res.status(200).json(currentToken);
}
