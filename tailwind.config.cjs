/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e293b',
          light: '#334155',
        },
        secondary: {
          DEFAULT: '#f8fafc',
          dark: '#e2e8f0',
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        }
      }
    },
  },
  darkMode: 'class',
  plugins: [],
} 