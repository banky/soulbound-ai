import { DalleImage, Token, ImageModel, Order } from "@prisma/client";
import { Descriptor } from "types/descriptor";

/**
 * Generate images for a user that has minted a SBT
 * @returns
 */
export const generateImages = async (prompt: string): Promise<Order> => {
  const response = await fetch("/api/generate-images", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
    }),
  });
  console.log("response", response);
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

export const getImageModel = async (
  address: string
): Promise<ImageModel | null> => {
  const res = await fetch(
    `/api/image-model?address=${address.toLocaleLowerCase()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
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

export const postImageModel = async (): Promise<ImageModel> => {
  const res = await fetch("/api/image-model", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
};

export const uploadImages = async (formData: FormData): Promise<void> => {
  const res = await fetch("/api/upload-images", {
    method: "POST",
    body: formData,
  });
  return res.json();
};

export const postTrainModel = async (descriptor: Descriptor): Promise<void> => {
  const res = await fetch("/api/train-model", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      descriptor,
    }),
  });
  return res.json();
};

export const getOrders = async (address: string): Promise<Order[]> => {
  const res = await fetch(`/api/orders?address=${address.toLowerCase()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
};
