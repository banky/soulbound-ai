import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { addressHasSBT } from "helpers/contract-reads";
import { unstable_getServerSession } from "next-auth";
import { authOptions, Session } from "./auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== "DELETE") {
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

  if (hasSBT) {
    return res
      .status(401)
      .json({ message: "Shan't delete image for user that still has SBT" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_KEY ?? ""
  );

  const prisma = new PrismaClient();
  const token = await prisma.token.findUnique({
    where: {
      owner: address,
    },
  });

  const imagePath = token?.imagePath;
  if (imagePath == null) {
    return res.status(404).json({ message: "Could not find image to delete" });
  }

  const { error } = await supabase.storage.from("images").remove([imagePath]);

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

  if (error != null) {
    return res.status(500).json({ message: "Failed to delete image" });
  }

  return res.status(200).end();
}
