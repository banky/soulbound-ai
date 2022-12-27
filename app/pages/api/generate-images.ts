// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import { ethers } from "ethers";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const provider = new ethers.providers.JsonRpcProvider();

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== "POST") {
    return res.status(400).json({ status: "Invalid method" });
  }

  const { address } = req.body;
  const hasSBT = await addressHasSBT(address);

  res.status(200).json({ balance: balance.toNumber() });

  // const createPromptResponse = await openai.createCompletion({
  //   model: "text-davinci-003",
  //   prompt:
  //     "Write a text prompt for a AI art generation software that would fit the art style of Kilian Eng",
  //   max_tokens: 50,
  //   temperature: 0.7,
  // });

  // const imagePrompt = `A vicious Olympic competitor, eyeing the gold medal`;

  // if (!imagePrompt) {
  //   res.status(500).json({ status: "error" });
  //   return;
  // }

  // console.log("imagePrompt", imagePrompt);

  // // TODO: Error handling
  // const response = await openai.createImage({
  //   prompt: imagePrompt,
  //   n: 2,
  //   size: "512x512",
  // });

  // res.status(200).json(response.data);
}
