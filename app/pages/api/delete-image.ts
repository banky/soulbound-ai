import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { addressHasSBT } from "helpers/contract-reads";

const supabase = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_KEY ?? ""
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== "DELETE") {
    return res.status(400).json({ message: "Invalid method" });
  }

  const { address } = req.body;
  const hasSBT = await addressHasSBT(address);

  if (hasSBT) {
    return res
      .status(401)
      .json({ message: "Shan't delete image for user that still has SBT" });
  }

  const { error } = await supabase.storage
    .from("images")
    .remove([`test-123.png`]);

  if (error != null) {
    return res.status(500).json({ message: "Failed to delete image" });
  }

  return res.status(200).end();
}
