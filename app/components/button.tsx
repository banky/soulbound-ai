import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

export const Button = (
  props: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
) => {
  return (
    <button
      className="bg-white disabled:bg-slate-400 rounded-sm px-12 py-2 text-blue mx-auto block w-fit"
      {...props}
    >
      Mint
    </button>
  );
};
