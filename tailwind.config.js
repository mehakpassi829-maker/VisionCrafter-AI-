/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          purple: '#C084FC',
          pink: '#E879A8',
          lightPink: '#F9A8D4',
          navy: '#1F1B2E',
          gray: '#6B6B80',
          lavenderBg: '#F7F5FF',
          lavenderBorder: '#DDD6FE',
          pinkBg: '#FFF5F7',
          pinkBorder: '#FBCFE8',
        }
      },
      boxShadow: {
        'glow-purple': '0 10px 25px -5px rgba(192, 132, 252, 0.4)',
        'soft-card': '0 4px 24px -2px rgba(192, 132, 252, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
      }
    },
  },
  plugins: [],
}
