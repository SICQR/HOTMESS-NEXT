/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind v4 scans automatically via the PostCSS plugin; no content globs needed.
  theme: {
    extend: {
      colors: {
        brand: '#ff2b70',
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
};
