/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'coral': '#FF6B6B',
        'deep-rose': '#E63946',
        'soft-peach': '#FFB3B3',
        'cream': '#FFF8E7',
        'charcoal': '#2D3436',
        'golden': '#FDCB6E',
      },
      fontFamily: {
        'display': ['Poppins', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}