import { getCsrfToken, signIn, useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { SiweMessage } from "siwe";
import { useAccount, useNetwork, useSignMessage } from "wagmi";
import { Button } from "./button";
import { ConnectButton } from "./connect-button";

export const SignInButton = () => {
  const { status } = useSession();
  const { address, isDisconnected } = useAccount();
  const { chain } = useNetwork();
  const { signMessageAsync } = useSignMessage();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const signOutOnDisconnect = async () => {
      await signOut({
        redirect: false,
        callbackUrl: "/",
      });
    };

    if (isDisconnected) {
      signOutOnDisconnect();
    }
  }, [isDisconnected]);

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

  if (status === "loading" || loading) {
    return <Button disabled>Loading</Button>;
  }

  if (!address) {
    return <ConnectButton />;
  }

  if (status === "unauthenticated") {
    return <Button onClick={onClickSignIn}>Sign in with Ethereum</Button>;
  }

  return null;
};
