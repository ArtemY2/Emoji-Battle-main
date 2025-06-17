/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#8b5cf6', // фиолетовый
          DEFAULT: '#7c3aed',
          dark: '#6d28d9',
        },
        secondary: {
          light: '#ec4899', // розовый
          DEFAULT: '#db2777',
          dark: '#be185d',
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}