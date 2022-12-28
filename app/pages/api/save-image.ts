import { addressHasSBT } from "helpers/contract-reads";
import { NextApiRequest, NextApiResponse } from "next";
import { Storage } from "@google-cloud/storage";

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

  const bucket = storage.bucket("soulbound-ai");

  // TODO: Check if file already exists. If it does, disallow creating a new file
  const file = bucket.file(`${address}.png`);
  const writeStream = file.createWriteStream();

  const imageResponse = await fetch(imageUrl);

  // @ts-ignore pipe exists
  imageResponse?.body?.pipe(writeStream);
}
