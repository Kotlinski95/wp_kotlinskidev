/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    './src/**/*.{js,ts,jsx,tsx,html,php}',
    './*.php',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

