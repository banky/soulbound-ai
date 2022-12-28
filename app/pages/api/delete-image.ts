import { NextApiRequest, NextApiResponse } from "next";
import { Storage } from "@google-cloud/storage";
import { addressHasSBT } from "helpers/contract-reads";

const storage = new Storage({
  projectId: process.env.GOOGLE_STORAGE_PROJECT_ID,
  credentials: {
    type: process.env.GOOGLE_STORAGE_TYPE,
    private_key: process.env.GOOGLE_STORAGE_PRIVATE_KEY,
    client_email: process.env.GOOGLE_STORAGE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_STORAGE_CLIENT_ID,
  },
});

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

  const bucket = storage.bucket("soulbound-ai");
  await bucket.file(`${address}.png`).delete();

  return res.status(200).end();
}
