import { addressHasSBT } from "helpers/contract-reads";
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

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

  const { address, imageUrl } = req.body;
  const hasSBT = await addressHasSBT(address);

  if (!hasSBT) {
    return res
      .status(401)
      .json({ message: "Unauthorized. User does not have a soulbound AI SBT" });
  }

  const image = await fetch(imageUrl);
  const blob = await image.blob();
  const { error } = await supabase.storage
    .from("images")
    .upload(`test-123.png`, blob, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error != null) {
    return res.status(500).json({ message: "Failed to save image" });
  }

  return res.status(200).end();
}
