/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: "#0A0F1A",
        card: "#101826",
        surface: "#172033",
        divider: "#253247",
        primary: "#2563EB",
        primaryDark: "#1D4ED8",
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
        info: "#0D9488"
      }
    }
  },
  plugins: []
};
