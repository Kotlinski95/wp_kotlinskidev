/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    "./*.php",
    "./template-parts/**/*.php",
    "./inc/**/*.php",
    "./patterns/**/*.php",
    "./blocks/**/*.js",
    "./**/*.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

