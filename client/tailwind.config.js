/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#dcedff',
          200: '#b9dcff',
          300: '#86c3ff',
          400: '#53a9ff',
          500: '#1f8fff',
          600: '#0a6fe0',
          700: '#0754ad',
          800: '#073e7a',
          900: '#05294d',
        },
      },
    },
  },
  plugins: [],
};
