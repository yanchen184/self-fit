const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  // 基本 Expo webpack 配置
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['nativewind'],
    },
  }, argv);
  
  // 設置 GitHub Pages 路徑
  if (process.env.NODE_ENV === 'production') {
    config.output.publicPath = '/self-fit/';
  }

  // 確保 NativeWind 與 Tailwind CSS 能正確處理
  config.module.rules.push({
    test: /\.css$/,
    use: [
      'style-loader',
      { loader: 'css-loader', options: { importLoaders: 1 } },
      'postcss-loader',
    ],
  });

  return config;
};
