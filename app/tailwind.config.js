/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./slots/**/*.{js,ts,jsx,tsx}",
    "./svg/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#FCF0D7",
        blue: "#182F69",
      },
    },
  },
  plugins: [],
};
