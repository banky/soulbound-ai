import fetch from "node-fetch";
import dotenv from "dotenv";
import prisma from "../clients/prisma";
import { StockPromptClass } from "@prisma/client";
dotenv.config();

/**
 * Scrape the neural love prompt library
 */
const main = async () => {
  const classes: StockPromptClass[] = ["MAN", "WOMAN", "OTHER"];

  await Promise.all(
    classes.map(async (currentClass) => {
      const manResponse = await fetch(
        `https://saas.neural.love/api/ai-photostock/pack/prompts?class=${currentClass.toLowerCase()}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEURAL_LOVE_BEARER_TOKEN}`,
          },
        }
      );

      if (!manResponse.ok) {
        throw new Error("Error fetching the prompts");
      }

      const parsedManResponse: Array<{
        prompt: string;
        negativePrompt: string;
      }> = await manResponse.json();

      await prisma.stockPrompt.createMany({
        data: parsedManResponse.map((response) => ({
          ...response,
          class: currentClass,
        })),
      });
    })
  );
};

main();
