/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in':        'fadeIn 0.4s ease-out both',
        'slide-up':       'slideUp 0.4s ease-out both',
        'slide-up-1':     'slideUp 0.4s ease-out 0.05s both',
        'slide-up-2':     'slideUp 0.4s ease-out 0.10s both',
        'slide-up-3':     'slideUp 0.4s ease-out 0.15s both',
        'slide-up-4':     'slideUp 0.4s ease-out 0.20s both',
        'slide-down':     'slideDown 0.3s ease-out both',
        'scale-in':       'scaleIn 0.25s ease-out both',
      },
    },
  },
  plugins: [],
}
