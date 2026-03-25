import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4FB6B2',
          light: '#CFEDEA',
          hover: '#3da09c',
        },
        surface: {
          bg: '#F7FAFA',
          card: '#FFFFFF',
          divider: '#E6EEEE',
        },
        content: {
          primary: '#2F3A3A',
          secondary: '#7A8A8A',
        },
        status: {
          success: '#6BCB77',
          warning: '#F2B544',
          error: '#E76F51',
        },
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 1px 4px rgba(47,58,58,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
