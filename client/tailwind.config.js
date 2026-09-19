/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#E3FDFD',
        surface: {
          DEFAULT: '#CBF1F5',
          light: '#E3FDFD',
          border: '#A6E3E9',
        },
        cyber: {
          blue: '#71C9CE',
          cyan: '#71C9CE',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B',
        },
        aegis: {
          ice: '#E3FDFD',
          frost: '#CBF1F5',
          aqua: '#A6E3E9',
          teal: '#71C9CE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
