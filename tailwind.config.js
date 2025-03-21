/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg": "#22272e",
        "bgdark": "#1c2128",
        "main": "#009788",
        "maindark": "#00645a",
        "secondary": "#03a9f4",
        "secondarydark": "#0276aa",
        "success": "#27ea60",
        "error": "#c0392b",
        "warning": "#e67e22",
        "warningdark": "#ab5e1a",
        "hr": "#444c56",
        "hrdark": "#292e36",
        "textlight": "#9ca3af",
        "admin": "#2563eb"
      },
      animation: {
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        'shake': {
          '10%, 90%': {
            transform: 'translate3d(-1px, 0, 0)'
          },
          '20%, 80%': {
            transform: 'translate3d(1px, 0, 0)'
          },
          '30%, 50%, 70%': {
            transform: 'translate3d(-3px, 0, 0)'
          },
          '40%, 60%': {
            transform: 'translate3d(3px, 0, 0)'
          }
        }
      },
      transitionProperty: {
        height: 'height'
      }
    },
  },
  plugins: [],
}
