import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

const supabase = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_KEY ?? ""
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  switch (req.method) {
    case "GET":
      await getImage(req, res);
      break;

    default:
      res.status(400).json({ message: "Invalid method" });
  }
}

const getImage = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const { imagePath } = req.body;

  if (typeof imagePath !== "string" || imagePath.length === 0) {
    res.status(400).json({ message: "Invalid imagePath" });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(imagePath);

  res.status(200).json({ publicUrl });
};
