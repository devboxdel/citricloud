/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Role color classes
    'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-cyan-500', 'bg-orange-500',
    'bg-gray-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-500', 'bg-sky-500',
    'bg-fuchsia-500', 'bg-violet-500', 'bg-rose-500',
    // Role background colors
    'bg-blue-100', 'bg-red-100', 'bg-green-100', 'bg-purple-100', 'bg-yellow-100',
    'bg-pink-100', 'bg-indigo-100', 'bg-teal-100', 'bg-cyan-100', 'bg-orange-100',
    'bg-gray-100', 'bg-amber-100', 'bg-lime-100', 'bg-emerald-100', 'bg-sky-100',
    'bg-fuchsia-100', 'bg-violet-100', 'bg-rose-100',
    // Dark mode role background colors
    'dark:bg-blue-900/30', 'dark:bg-red-900/30', 'dark:bg-green-900/30', 'dark:bg-purple-900/30',
    'dark:bg-yellow-900/30', 'dark:bg-pink-900/30', 'dark:bg-indigo-900/30', 'dark:bg-teal-900/30',
    'dark:bg-cyan-900/30', 'dark:bg-orange-900/30', 'dark:bg-gray-900/30', 'dark:bg-amber-900/30',
    'dark:bg-lime-900/30', 'dark:bg-emerald-900/30', 'dark:bg-sky-900/30', 'dark:bg-fuchsia-900/30',
    'dark:bg-violet-900/30', 'dark:bg-rose-900/30',
    // Role text colors
    'text-blue-700', 'text-red-700', 'text-green-700', 'text-purple-700', 'text-yellow-700',
    'text-pink-700', 'text-indigo-700', 'text-teal-700', 'text-cyan-700', 'text-orange-700',
    'text-gray-700', 'text-amber-700', 'text-lime-700', 'text-emerald-700', 'text-sky-700',
    'text-fuchsia-700', 'text-violet-700', 'text-rose-700',
    // Dark mode role text colors
    'dark:text-blue-400', 'dark:text-red-400', 'dark:text-green-400', 'dark:text-purple-400',
    'dark:text-yellow-400', 'dark:text-pink-400', 'dark:text-indigo-400', 'dark:text-teal-400',
    'dark:text-cyan-400', 'dark:text-orange-400', 'dark:text-gray-400', 'dark:text-amber-400',
    'dark:text-lime-400', 'dark:text-emerald-400', 'dark:text-sky-400', 'dark:text-fuchsia-400',
    'dark:text-violet-400', 'dark:text-rose-400',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgb(var(--color-primary-50) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100) / <alpha-value>)',
          200: 'rgb(var(--color-primary-200) / <alpha-value>)',
          300: 'rgb(var(--color-primary-300) / <alpha-value>)',
          400: 'rgb(var(--color-primary-400) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700) / <alpha-value>)',
          800: 'rgb(var(--color-primary-800) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glass-shimmer': 'glassShimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glassShimmer: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
