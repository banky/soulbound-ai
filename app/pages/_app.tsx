import "../styles/globals.css";
import type { AppProps } from "next/app";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { Chain, configureChains, createClient, WagmiConfig } from "wagmi";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  hardhat,
  goerli,
} from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { Inconsolata } from "@next/font/google";
import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

const inconsolata = Inconsolata({ subsets: ["latin"] });

const configure = () => {
  const chains: Chain[] = [];

  switch (process.env.NEXT_PUBLIC_ENVIRONMENT) {
    case "localhost":
      chains.push(hardhat);
      break;

    case "preview":
      chains.push(goerli);
      break;

    case "production":
      chains.push(mainnet);
      break;

    default:
      break;
  }

  return configureChains(chains, [publicProvider()]);
};

const { chains, provider } = configure();
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
          <QueryClientProvider client={queryClient}>
            <div className={inconsolata.className}>
              <Component {...pageProps} />
            </div>
          </QueryClientProvider>
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
