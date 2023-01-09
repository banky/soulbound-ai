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

export const getToken = async (address: string): Promise<Token> => {
  const res = await fetch(`/api/token?address=${address}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
};

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

export const deleteToken = async (): Promise<void> => {
  await fetch("/api/token", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const getDalleImages = async (
  address: string
): Promise<DalleImage[]> => {
  const res = await fetch(`/api/dalle-images?address=${address}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
};
