import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { Button } from "./button";

type ActiveButtonProps = {
  loading: boolean;
  error: string;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export const ButtonWithError = ({ error, ...props }: ActiveButtonProps) => {
  return (
    <>
      <Button {...props}></Button>
      {error !== "" ? (
        <p className="text-red-500 text-center mt-4">{error}</p>
      ) : null}
    </>
  );
};
