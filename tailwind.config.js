/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind v4 scans automatically via the PostCSS plugin; no content globs needed.
  theme: {
    extend: {
      colors: {
        brand: '#ff2b70',
        hm: {
          bg: 'var(--hm-color-bg)',
          surface: 'var(--hm-color-surface)',
          text: 'var(--hm-color-text)',
          primary: 'var(--hm-color-primary)',
          accent: 'var(--hm-color-accent)',
          border: 'var(--hm-color-border)',
        },
      },
      borderRadius: {
        xl: '1rem',
        hm: 'var(--hm-radius-sm)',
      },
    },
  },
  plugins: [],
};
