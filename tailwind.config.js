/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '420px',
      },
      colors: {
        cream: {
          50: '#fffeef',
          100: '#fdfce3',
          200: '#faf7c4',
          DEFAULT: '#fffeef',
        },
        lime: {
          accent: '#9fd700',
          hover: '#8cb800',
          light: '#f2fcd0',
          dark: '#698e00',
          DEFAULT: '#9fd700',
        },
        slateForest: {
          50: '#eef3f1',
          100: '#d7e4df',
          500: '#446158',
          600: '#385049',
          700: '#2d403a',
          DEFAULT: '#446158',
        },
        charcoal: {
          DEFAULT: '#272c1a',
          dark: '#1e2214',
          surface: '#323922',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(39, 44, 26, 0.05)',
        'card': '0 4px 16px rgba(39, 44, 26, 0.08)',
        'elevated': '0 8px 30px rgba(39, 44, 26, 0.12)',
      }
    },
  },
  plugins: [],
}
