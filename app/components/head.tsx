import { default as NextHead } from "next/head";

export const Head = () => {
  return (
    <NextHead>
      <title>Soulbound AI</title>
      <meta name="description" content="Mint a unique SoulBound NFT using AI" />

      {/* <!-- Facebook Meta Tags --> */}
      <meta property="og:url" content="/" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Soulbound AI" />
      <meta
        property="og:description"
        content="Mint a unique SoulBound NFT using AI"
      />
      <meta
        property="og:image"
        content="https://soulbound-ai.com/preview-image.png"
      />

      {/* <!-- Twitter Meta Tags --> */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:domain" content="soulbound-ai.com" />
      <meta property="twitter:url" content="/" />
      <meta name="twitter:title" content="Soulbound AI" />
      <meta
        name="twitter:description"
        content="Mint a unique SoulBound NFT using AI"
      />
      <meta
        name="twitter:image"
        content="https://soulbound-ai.com/preview-image.png"
      />
    </NextHead>
  );
};
