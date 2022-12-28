// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import { addressHasSBT } from "helpers/contract-reads";
import { publicKeyToMnemonic } from "helpers/public-key";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== "POST") {
    return res.status(400).json({ message: "Invalid method" });
  }

  const { address } = req.body;
  const hasSBT = await addressHasSBT(address);
  if (!hasSBT) {
    return res
      .status(401)
      .json({ message: "Unauthorized. User does not have a soulbound AI SBT" });
  }

  const mnemonic = publicKeyToMnemonic(address);
  const words = mnemonic.split(" ");
  const firstWord = words[0];
  const lastWord = words[words.length - 1];

  const createPromptResponse = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Write a text prompt for a AI art generation software that includes the following words: ${firstWord}, ${lastWord}`,
    max_tokens: 50,
    temperature: 0.7,
  });

  const imagePrompt = createPromptResponse.data.choices[0].text;

  if (!imagePrompt) {
    res.status(500).json({ message: "Could not generate image prompt" });
    return;
  }

  // TODO: Error handling
  const response = await openai.createImage({
    prompt: imagePrompt,
    n: 4,
    size: "512x512",
  });
  const imageUrls = response.data.data.map(({ url }) => url);

  res.status(200).json({ prompt: imagePrompt, imageUrls });
}
