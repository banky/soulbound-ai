import { default as NextHead } from "next/head";

export const Head = () => {
  return (
    <NextHead>
      <title>Soulbound AI</title>
      <meta property="og:url" content={process.env.DOMAIN} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Soulbound AI" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        property="og:description"
        content="Mint a unique SoulBound NFT using AI"
      />
      <meta property="og:image" content="/preview-image.png" />
    </NextHead>
  );
};
