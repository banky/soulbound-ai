import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { useState } from "react";
import { SiweMessage } from "siwe";
import { useAccount, useNetwork, useSignMessage } from "wagmi";
import { Button } from "./button";
import { ConnectButton } from "./connect-button";

export const SignInButton = () => {
  const { status } = useSession();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { signMessageAsync } = useSignMessage();
  const [loading, setLoading] = useState(false);

  const onClickSignIn = async () => {
    setLoading(true);

    const message = new SiweMessage({
      domain: window.location.host,
      address: address,
      statement: "Sign in with Ethereum to the app.",
      uri: window.location.origin,
      version: "1",
      chainId: chain?.id,
      nonce: await getCsrfToken(),
    });

    const signature = await signMessageAsync({
      message: message.prepareMessage(),
    });

    signIn("credentials", {
      message: JSON.stringify(message),
      redirect: false,
      signature,
      callbackUrl: "/",
    });

    setLoading(false);
  };

  if (!address) {
    return <ConnectButton />;
  }

  if (status === "unauthenticated") {
    return <Button onClick={onClickSignIn}>Sign in with Ethereum</Button>;
  }

  if (status === "loading" || loading) {
    return <Button disabled>Loading</Button>;
  }

  return null;
};
