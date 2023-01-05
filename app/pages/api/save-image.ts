import { addressHasSBT } from "helpers/contract-reads";
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { publicKeyToMnemonic } from "helpers/public-key";
import { randomUUID } from "crypto";
import { unstable_getServerSession } from "next-auth";
import { authOptions, Session } from "./auth/[...nextauth]";

const supabase = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_KEY ?? ""
);

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
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { address } = session;
  const { imageUrl: sourceImageUrl } = req.body;
  const hasSBT = await addressHasSBT(address);

  if (!hasSBT) {
    return res
      .status(401)
      .json({ message: "Unauthorized. User does not have a soulbound AI SBT" });
  }

  const image = await fetch(sourceImageUrl);
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

  // supabase.storage.from("images").

  const prisma = new PrismaClient();
  const currentToken = await prisma.token.findFirst({
    where: { owner: address },
  });
  const currentImagePath = currentToken?.imageUrl.sub;

  const token = await prisma.token.update({
    where: { owner: address },
    data: {
      imageUrl: publicUrl,
    },
  });

  if (error != null) {
    return res.status(500).json({ message: "Failed to save image" });
  }

  return res.status(200).end();
}
