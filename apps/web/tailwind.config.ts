import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          900: "#14532d",
        },
        // Figma design tokens
        vg: {
          green:        "#00873a", // primary button / icon bg
          "green-dark": "#006b2c", // links, active text
          "green-dot":  "#006d30", // status dot
          "green-light":"#92f5a4", // active nav bg, badges
          bg:           "#f9f9ff", // app background
          "bg-accent":  "#f0f3ff", // search bar, appointment cards
          heading:      "#151c27", // h1/h2 text
          body:         "#3e4a3d", // body / label text
          muted:        "#6b7280", // placeholder text
          border:       "#bdcaba", // all borders
          error:        "#ba1a1a", // error / overdue red
        },
      },
    },
  },
  plugins: [],
}

export default config
