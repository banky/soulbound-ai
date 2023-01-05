import "../styles/globals.css";
import type { AppProps } from "next/app";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  localhost,
  hardhat,
} from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { Inconsolata } from "@next/font/google";
import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";

const inconsolata = Inconsolata({ subsets: ["latin"] });

const { chains, provider } = configureChains(
  [mainnet, polygon, optimism, arbitrum, hardhat],
  [publicProvider()]
);
const { connectors } = getDefaultWallets({
  appName: "Soulbound AI",
  chains,
});
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <WagmiConfig client={wagmiClient}>
      <SessionProvider session={pageProps.session} refetchInterval={0}>
        <RainbowKitProvider chains={chains}>
          <div className={inconsolata.className}>
            <Component {...pageProps} />
          </div>
        </RainbowKitProvider>
      </SessionProvider>
    </WagmiConfig>
  );
};

/**
 * SSR doesn't work well with wagmi
 */
export default dynamic(() => Promise.resolve(App), {
  ssr: false,
});
