/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3f8f4',
          100: '#dbeede',
          200: '#b8ddc1',
          300: '#8ec99f',
          400: '#61b07a',
          500: '#3f9360',
          600: '#2f7750',
          700: '#265f41',
          800: '#1f4b34',
          900: '#193c2a'
        },
        accent: {
          50: '#fff8e8',
          100: '#fee7b7',
          200: '#fdd078',
          300: '#f7b03c',
          400: '#e7921b',
          500: '#c8760f',
          600: '#a65b0c',
          700: '#82450e',
          800: '#663612',
          900: '#532e12'
        }
      }
    }
  },
  plugins: []
};
