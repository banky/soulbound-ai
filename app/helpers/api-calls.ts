import { Token, ImageModel, Order } from "@prisma/client";
import { Descriptor } from "types/descriptor";

const fetchAndThrow = async (
  input: RequestInfo | URL,
  init?: RequestInit | undefined
): Promise<Response> => {
  const response = await fetch(input, init);

  if (!response.ok) {
    let result: any;
    try {
      result = await response.json();
    } catch (error) {
      throw new Error("An unexpected error occured");
    }

    throw new Error(result.message);
  }

  return response;
};

/**
 * Generate images for a user that has minted a SBT
 * @returns
 */
export const generateImages = async (prompt: string): Promise<Order> => {
  const response = await fetchAndThrow("/api/generate-images", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
    }),
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
  const res = await fetchAndThrow(
    `/api/token?address=${address.toLocaleLowerCase()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return res.json();
};

export const getImageModel = async (
  address: string
): Promise<ImageModel | null> => {
  const res = await fetchAndThrow(
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
 * Update a token with a given generated image
 * @param imageIndex
 * @returns
 */
export const postToken = async ({
  orderId,
  imageIndex,
}: {
  orderId: string;
  imageIndex: number;
}): Promise<Token> => {
  const res = await fetchAndThrow("/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderId,
      imageIndex,
    }),
  });
  return res.json();
};

/**
 * Delete a token
 */
export const deleteToken = async (): Promise<void> => {
  await fetchAndThrow("/api/token", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const postImageModel = async (): Promise<ImageModel> => {
  const res = await fetchAndThrow("/api/image-model", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
};

export const uploadImages = async (formData: FormData): Promise<void> => {
  const res = await fetchAndThrow("/api/upload-images", {
    method: "POST",
    body: formData,
  });
  return res.json();
};

export const postTrainModel = async (descriptor: Descriptor): Promise<void> => {
  const res = await fetchAndThrow("/api/train-model", {
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
  const res = await fetchAndThrow(
    `/api/orders?address=${address.toLowerCase()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return res.json();
};
