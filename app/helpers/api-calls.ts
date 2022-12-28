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
