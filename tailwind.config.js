/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Official PulseFit Design System (8 approved base colors)
        backgroundLight: "#F2F2F7",
        surfaceLight: "#FFFFFF",
        backgroundDark: "#000000",
        surfaceDark: "#1C1C1E",
        primary: "#E91E63",
        link: "#007AFF",
        success: "#34C759",
        danger: "#FF3B30",
        destructive: "#FF3B30",

        // Semantic aliases
        background: "#000000",
        surface: "#1C1C1E",
        card: "#1C1C1E",
        navy: "#000000",
        info: "#007AFF",
        warning: "#F2F2F7"
      }
    }
  },
  plugins: []
};
