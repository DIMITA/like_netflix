/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'netflix-red': '#e50914',
        'netflix-dark': '#141414',
        'netflix-black': '#0f0f0f',
        'netflix-gray': '#b3b3b3',
        'netflix-card': '#181818',
      },
      fontFamily: {
        sans: ['Roboto', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(to right, rgba(0,0,0,0.85) 40%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
