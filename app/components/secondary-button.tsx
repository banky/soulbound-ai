import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { Button } from "./button";

export const SecondaryButton = (
  props: { loading: boolean } & DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
) => {
  return (
    <Button
      {...props}
      className={`bg-transparent disabled:bg-slate-400 text-white border-2 border-white disabled:border-slate-400 ${
        props.className ?? ""
      }`}
    ></Button>
  );
};
