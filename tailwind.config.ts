import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Love Lens Color Palette - Warm Minimalism
        primary: {
          coral: "#FF6B6B",
          rose: "#E63946",
        },
        secondary: {
          peach: "#FFB3B3",
          cream: "#FFF8E7",
        },
        neutral: {
          charcoal: "#2D3436",
          light: "#F8F9FA",
        },
        accent: {
          golden: "#FDCB6E",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        // Typography System
        'poppins': ['Poppins', 'sans-serif'], // Headers - playful, modern
        'inter': ['Inter', 'sans-serif'],     // Body - clean, readable
        'dancing': ['Dancing Script', 'cursive'], // Accent - romantic touch
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.6s ease-out',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%': { boxShadow: '0 0 20px rgba(255, 107, 107, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(255, 107, 107, 0.6)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      gradientColorStops: {
        'love-gradient': {
          'from': '#FF6B6B',
          'via': '#FFB3B3',
          'to': '#FFF8E7',
        },
      },
      boxShadow: {
        'love-card': '0 10px 25px rgba(255, 107, 107, 0.1)',
        'love-button': '0 5px 15px rgba(230, 57, 70, 0.3)',
      },
    },
  },
  plugins: [],
};
export default config;
