/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#667eea',
          dark: '#5568d3',
        },
        secondary: {
          DEFAULT: '#f093fb',
          dark: '#e07eea',
        },
        accent: {
          DEFAULT: '#f5576c',
          dark: '#e04558',
        },
        bg: {
          primary: '#0a0a0f',
          secondary: '#13131a',
          tertiary: '#1a1a24',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a0a0b0',
        },
        border: '#2a2a35',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-hero': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f5576c 100%)',
      },
    },
  },
  plugins: [],
};
