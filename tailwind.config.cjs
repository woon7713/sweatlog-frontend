/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Pretendard', ...defaultTheme.fontFamily.sans],
        oswald: ['Oswald', 'sans-serif'],
      },
      colors: {
        'brand-primary': '#6835de',
        'brand-primary-dark': '#553C9A',
        'brand-red': '#E53E3E',
        'brand-gray': '#F7FAFC',
      }
    },
  },
  plugins: [],
}