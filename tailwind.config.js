/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function({ addBase, theme }) {
      addBase({
        // 全局滚动条样式
        '*::-webkit-scrollbar': {
          width: '0.1875rem', // 3px，原来的一半
          height: '0.1875rem',
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: theme('colors.gray.300'),
          borderRadius: '9999px',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: theme('colors.gray.400'),
        },
        // 当没有滚动内容时隐藏滚动条
        '*::-webkit-scrollbar-thumb:vertical': {
          minHeight: '30px',
          'background-clip': 'content-box',
        },
        '*::-webkit-scrollbar-thumb:horizontal': {
          minWidth: '30px',
          'background-clip': 'content-box',
        },
        // 当内容不需要滚动时隐藏滚动条
        '*:not(:hover)::-webkit-scrollbar-thumb': {
          backgroundColor: 'transparent',
        },
        '*::-webkit-scrollbar-corner': {
          backgroundColor: 'transparent',
        },
      });
    },
  ],
} 