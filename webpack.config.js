const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  // 基本 Expo webpack 配置
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // 設置 GitHub Pages 路徑
  if (process.env.NODE_ENV === 'production') {
    config.output.publicPath = '/self-fit/';
  }

  return config;
};
