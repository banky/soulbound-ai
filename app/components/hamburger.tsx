import { useState } from "react";

export const Hamburger = () => {
  const [hamburgerOpen, setHamburgerOpen] = useState(false);

  return (
    <button
      className="flex flex-col justify-between h-6"
      onClick={() => {
        setHamburgerOpen(!hamburgerOpen);
      }}
    >
      <div className="h-1 bg-pink-500 w-8" />
      <div className="h-1 bg-pink-500 w-8" />
      <div className="h-1 bg-pink-500 w-8" />
    </button>
  );
};
