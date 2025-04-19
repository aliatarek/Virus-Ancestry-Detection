/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'custom-radial': 'radial-gradient(circle, rgba(1,104,113,1) 0%, rgba(4,225,246,1) 49%, rgba(1,104,113,1) 98%)',
        'custom-linear': 'linear-gradient(90deg, rgba(1,104,113,1) 0%, rgba(4,225,246,1) 49%, rgba(1,104,113,1) 98%)',

      },
    },
  },
  plugins: [],
}