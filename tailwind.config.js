/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mainColor: "#231f20",
        bgColor: "#fefefe",
        blackColor: "#000000"
      },
      fontFamily: {
        mainFont: ["Alexandria"]
      }
    },
  },
  plugins: [],
};
