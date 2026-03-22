/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#faf7f2",
          100: "#f3ede2",
          200: "#e6d9c3",
          300: "#d5be9d",
          400: "#c3a077",
          500: "#b6895b",
          600: "#a87650",
          700: "#8c5f43",
          800: "#724e3b",
          900: "#5d4132",
          950: "#322019",
        },
        dark: {
          DEFAULT: "#1a1a1a",
          800: "#2a2a2a",
          900: "#111111",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        serif: ['"Playfair Display"', "Georgia", "serif"],
      },
      letterSpacing: {
        widest2: "0.2em",
        widest3: "0.3em",
      },
    },
  },
  plugins: [],
};
