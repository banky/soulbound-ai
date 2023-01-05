import type { NextApiRequest, NextApiResponse } from "next";
import { addressHasSBT } from "helpers/contract-reads";
import { firstAndLastMnemonic } from "helpers/public-key";
import { PrismaClient } from "@prisma/client";
import { createImages } from "helpers/images";
import { authOptions, Session } from "./auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

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
  const hasSBT = await addressHasSBT(address);
  if (!hasSBT) {
    return res
      .status(401)
      .json({ message: "Unauthorized. User does not have a soulbound AI SBT" });
  }

  const seedWords = firstAndLastMnemonic(address);
  const { imagePrompt, imageUrls } = await createImages(seedWords);

  const prisma = new PrismaClient();

  // Save the urls to all the images generated
  await Promise.all(
    imageUrls.map((imageUrl, index) => {
      return prisma.dalleImage.create({
        data: {
          owner: address,
          imageIndex: index,
          imageUrl,
        },
      });
    })
  );

  // Save the token without an image url. User needs to select an image
  await prisma.token.create({
    data: {
      owner: address,
      name: seedWords.join(", "),
      description: imagePrompt,
    },
  });

  res.status(200).json({ prompt: imagePrompt, imageUrls });
}
