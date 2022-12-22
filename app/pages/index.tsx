import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <>
      <header className="flex justify-between">
        <h1 className="text-3xl">soulbound ai</h1>
        <ConnectButton />
      </header>

      <main className="mt-40">
        <h2 className="text-center text-pink-500 text-7xl">
          Mint a unique SoulBound NFT using AI
        </h2>
      </main>
    </>
  );
}
