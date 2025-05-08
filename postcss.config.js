module.exports = {
  plugins: {
    'nativewind/postcss': {
      // 確保異步處理正確
      async: true,
    },
    tailwindcss: {},
    autoprefixer: {},
  },
};
