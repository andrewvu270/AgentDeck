/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#a78bfa',
          dark: '#8b5cf6',
        },
        secondary: {
          DEFAULT: '#ec4899',
          dark: '#db2777',
        },
        accent: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
        bg: {
          primary: '#000000',
          secondary: '#0a0a0a',
          tertiary: '#141414',
        },
        text: {
          primary: '#ffffff',
          secondary: '#9ca3af',
        },
        border: '#1f1f1f',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #ec4899 0%, #3b82f6 100%)',
        'gradient-hero': 'linear-gradient(135deg, #a78bfa 0%, #ec4899 50%, #3b82f6 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
