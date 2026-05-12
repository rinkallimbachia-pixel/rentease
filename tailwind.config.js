/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        re: {
          canvas: '#fdf9f3',
          surface: '#ffffff',
          ink: '#1a120b',
          muted: '#5c534a',
          subtle: '#8a8075',
          border: '#e8e0d6',
          accent: '#c05e28',
          'accent-hover': '#a34f20',
          'accent-soft': '#f5e6dc',
          'badge-tan': '#e8ddd4',
          'badge-sage': '#dce5d8',
          success: '#3d6b4a',
          'success-soft': '#e3ede5',
          danger: '#b42318',
          'danger-soft': '#fde8e6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        re: '0 1px 2px rgba(26, 18, 11, 0.04), 0 10px 28px rgba(26, 18, 11, 0.06)',
        're-lg': '0 4px 14px rgba(26, 18, 11, 0.06), 0 22px 50px rgba(26, 18, 11, 0.08)',
      },
    },
  },
  plugins: [],
};

