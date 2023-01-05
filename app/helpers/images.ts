import { Configuration, OpenAIApi } from "openai";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

/**
 * Fetches an image from a URL, saves it persistently
 * and returns a new public URL for the image
 *
 * @param imageUrl temporary imageUrl eg. from dall-e
 * @returns persistent public URL
 */
export const fetchAndSaveImage = async (imageUrl: string): Promise<string> => {
  const supabase = createClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_KEY ?? ""
  );

  const image = await fetch(imageUrl);
  const blob = await image.blob();
  const imagePath = `${randomUUID()}.png`;

  const { error } = await supabase.storage
    .from("images")
    .upload(imagePath, blob, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error !== null) {
    throw new Error("Failed to save image");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(imagePath);

  return publicUrl;
};

/**
 * Generate AI created images using a list of seed words
 * @param seedWords
 * @returns URLs for images generated
 */
export const createImages = async (
  seedWords: string[]
): Promise<{ imagePrompt: string; imageUrls: string[] }> => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const createPromptResponse = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Write a text prompt for a AI art generation software that includes the following words: ${seedWords.join(
      ", "
    )}`,
    max_tokens: 50,
    temperature: 0.7,
  });

  const imagePrompt = createPromptResponse.data.choices[0].text?.trim();

  if (!imagePrompt) {
    throw new Error("Could not generate image prompt");
  }

  const createImageResponse = await openai.createImage({
    prompt: imagePrompt,
    n: 4,
    size: "256x256",
  });
  const imageUrls = createImageResponse.data.data
    .map(({ url }) => url)
    .filter((url) => url !== undefined) as string[];

  if (imageUrls.length === 0) {
    throw new Error("No images were generated successfully");
  }

  return {
    imagePrompt,
    imageUrls,
  };
};
