module.exports = {
  plugins: {
    'nativewind/postcss': {
      // 确保异步处理正确
      async: true,
    },
    tailwindcss: {},
    autoprefixer: {},
  },
};
