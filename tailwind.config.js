/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#2563EB',
        'secondary': '#64748B',
        'background': '#F8FAFC',
        'text-primary': '#1E293B',
        'text-secondary': '#475569',
        'error': '#DC2626',
        'success': '#16A34A',
        'warning': '#D97706',
        'border': '#E2E8F0',
        'card-background': '#FFFFFF'
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      }
    }
  },
  plugins: []
}
