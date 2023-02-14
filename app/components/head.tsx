import { default as NextHead } from "next/head";

export const Head = () => {
  return (
    <NextHead>
      <title>soulbound ai</title>
      <meta name="description" content="Mint a unique SoulBound NFT using AI" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@0xbanky" />
      <meta property="og:url" content="https://soulbound-ai.com" />
      <meta property="og:title" content="soulbound ai" />
      <meta
        property="og:description"
        content="Mint a unique SoulBound NFT using AI"
      />
      <meta
        property="og:image"
        content="https://soulbound-ai.com/preview-image.png"
      />

      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
    </NextHead>
  );
};
