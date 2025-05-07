const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      // 啟用強制HTTPS
      https: true,
      // 添加PWA支持
      pwa: true
    },
    argv
  );
  
  // 自定義webpack配置
  config.output = {
    ...config.output,
    publicPath: process.env.NODE_ENV === 'production' ? '/self-fit/' : '/',
  };

  return config;
};
