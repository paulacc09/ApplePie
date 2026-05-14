/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF7F0',
          2: '#F5EFE6',
        },
        rose: {
          DEFAULT: '#E8B4BC',
          light: '#F9DDE0',
          dark: '#C4858F',
        },
        olive: {
          DEFAULT: '#8A9A6E',
          light: '#B5C49A',
          deep: '#6B7A52',
        },
        warm: '#FFFCF8',
        ink: '#3D2E2E',
        stone: '#7A6464',
        muted: '#7A6464',
        faded: '#B09898',
        line: '#F0E6E8',
        blush: '#FDE8EC',
        mint: '#EEF2E8',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(180, 120, 120, 0.08)',
        'card-hover': '0 6px 24px rgba(180, 120, 120, 0.15)',
      },
    },
  },
  plugins: [],
}
