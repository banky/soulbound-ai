import { default as NextHead } from "next/head";

export const Head = () => {
  return (
    <NextHead>
      <title>Soulbound AI</title>
      <meta name="description" content="Mint a unique SoulBound NFT using AI" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@0xbanky" />
      <meta property="og:url" content="https://soulbound-ai.com" />
      <meta property="og:title" content="Soulbound AI" />
      <meta
        property="og:description"
        content="Mint a unique SoulBound NFT using AI"
      />
      <meta
        property="og:image"
        content="https://soulbound-ai.com/preview-image.png"
      />
    </NextHead>
  );
};
