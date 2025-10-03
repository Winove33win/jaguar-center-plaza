/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f6ff',
          100: '#dbe8ff',
          200: '#b8d0ff',
          300: '#86b0ff',
          400: '#548dff',
          500: '#316eff',
          600: '#1d54db',
          700: '#1742b0',
          800: '#15378f',
          900: '#132f74'
        }
      }
    }
  },
  plugins: []
};
