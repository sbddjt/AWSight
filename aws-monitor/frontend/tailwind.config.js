/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        surface: {
          50:  "#f8fafc",
          900: "#0f0f17",
          950: "#08080f",
        },
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #6366f1, #06b6d4)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(99,102,241,0.15)",
        "glow-sm": "0 0 10px rgba(99,102,241,0.1)",
      },
    },
  },
  plugins: [],
};
