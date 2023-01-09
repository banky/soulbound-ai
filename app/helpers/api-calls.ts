import { DalleImage, Token } from "@prisma/client";

/**
 * Generate images for a user that has minted a SBT
 * @returns
 */
export const generateImages = async (): Promise<{
  imageUrls: string[];
}> => {
  const response = await fetch("/api/generate-images", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const parsedResponse = await response.json();
  return parsedResponse;
};

/**
 * Get a Token belonging to a given address. Returns null if it doesn't exist
 * @param address
 * @returns
 */
export const getToken = async (address: string): Promise<Token | null> => {
  const res = await fetch(`/api/token?address=${address.toLocaleLowerCase()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
};

/**
 * Update a token with a given Dalle Image index
 * @param imageIndex
 * @returns
 */
export const postToken = async (imageIndex: number): Promise<Token> => {
  const res = await fetch("/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageIndex,
    }),
  });
  return res.json();
};

/**
 * Delete a token
 */
export const deleteToken = async (): Promise<void> => {
  await fetch("/api/token", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Get all the generated dalle images for a given address
 * @param address
 * @returns
 */
export const getDalleImages = async (
  address: string
): Promise<DalleImage[]> => {
  const res = await fetch(
    `/api/dalle-images?address=${address.toLowerCase()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return res.json();
};
