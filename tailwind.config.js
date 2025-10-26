// tailwind.config.js
/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
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
        'brand-red': '#E53E3E',
        'brand-red-dark': '#9B2C2C',
        'brand-primary': '#C53030', // 메인 버튼 색상
        'brand-gray': '#F7FAFC',    // 전체 배경 색상
      }
    },
  },
  plugins: [],
}