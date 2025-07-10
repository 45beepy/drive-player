/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Important: This tells Tailwind where to find your HTML and React components
  ],
  theme: {
    extend: {}, // This is where you would customize Tailwind's default theme (colors, fonts, etc.)
  },
  plugins: [],
}