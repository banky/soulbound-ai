import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { Button } from "./button";

type ActiveButtonProps = {
  loading: boolean;
  error: string;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export const ActiveButton = ({
  loading,
  error,
  ...props
}: ActiveButtonProps) => {
  if (loading) {
    return (
      <Button {...props} disabled>
        Loading
      </Button>
    );
  }

  return (
    <>
      <Button {...props}></Button>
      {error !== "" ? (
        <p className="text-red-500 text-center mt-4">{error}</p>
      ) : null}
    </>
  );
};
