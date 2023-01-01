export const generateImages = async (
  address: string
): Promise<{
  prompt: string;
  imageUrls: string[];
}> => {
  const response = await fetch("/api/generate-images", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address,
    }),
  });
  const parsedResponse = await response.json();
  return parsedResponse;
};

/**
 * Save an image from an imageUrl associated with an ethereum address
 * @param address
 * @param imageUrl
 */
export const saveImage = async (
  // TODO: Error handling for undefined case
  address: string | undefined,
  imageUrl: string
): Promise<void> => {
  await fetch("/api/save-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address,
      imageUrl,
    }),
  });
};

export const deleteImage = async (address: string): Promise<void> => {
  await fetch("/api/delete-image", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address,
    }),
  });
};
