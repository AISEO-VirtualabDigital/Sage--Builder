/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f6f7f6',
          100: '#e3e7e3',
          200: '#c7cfc7',
          300: '#a1b0a1',
          400: '#7d8e7d',
          500: '#637263',
          600: '#4d5c4d',
          700: '#404a40',
          800: '#353d35',
          900: '#2d332d',
          950: '#141714',
        },
      },
    },
  },
  plugins: [],
}
