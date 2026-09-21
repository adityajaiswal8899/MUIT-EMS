/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        muit: {
          50: '#f0f5ff',
          100: '#e0ecff',
          200: '#bad5ff',
          300: '#7eb3ff',
          400: '#3a87ff',
          500: '#135bec',
          600: '#0042cd',
          700: '#0035a7',
          800: '#032d88',
          900: '#09296e',
          950: '#051846',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        certificate: ['Cinzel', 'serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -2px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 12px 32px -4px rgba(19, 91, 236, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'cert': '0 20px 40px -15px rgba(180, 83, 9, 0.25)',
      }
    },
  },
  plugins: [],
}
