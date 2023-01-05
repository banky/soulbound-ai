/**
 * Generate images for a user that has minted a SBT
 * @returns
 */
export const generateImages = async (): Promise<{
  prompt: string;
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
 * Save an image from an imageIndex of the generated images
 * @param imageIndex
 */
export const saveImage = async (imageIndex: number): Promise<void> => {
  await fetch("/api/save-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageIndex,
    }),
  });
};

/**
 * Clean up data after burning an SBT
 */
export const deleteImage = async (): Promise<void> => {
  await fetch("/api/delete-image", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};
