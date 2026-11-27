/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12303B',
        teal: { DEFAULT: '#0F7C7A', dark: '#0B5F5D', soft: '#DCEEEE' },
        mist: '#EEF3F3',
        line: '#D5E0E0',
        coral: { DEFAULT: '#D6453D', soft: '#FBE4E2' },
        amber: { DEFAULT: '#B87A00', soft: '#FBF0D4' },
        ok: { DEFAULT: '#1E8E5A', soft: '#DDF1E7' },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
