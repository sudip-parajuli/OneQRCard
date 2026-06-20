/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["'Cormorant Garamond'", "serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#7c3aed", // Premium Violet
          hover: "#6d28d9",
          light: "#f5f3ff",
          ring: "#a78bfa"
        }
      }
    },
  },
  plugins: [],
};
