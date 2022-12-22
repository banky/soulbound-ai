import { Inconsolata } from "@next/font/google";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <ConnectButton />
    </div>
  );
}
