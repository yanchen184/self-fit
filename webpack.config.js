const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

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

  // 添加 resolve 別名，確保 NativeWind 能夠正確解析
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-web': path.resolve(__dirname, 'node_modules/react-native-web'),
    'react-native': path.resolve(__dirname, 'node_modules/react-native-web'),
  };

  // 確保 NativeWind 與 Tailwind CSS 能正確處理
  config.module.rules.push({
    test: /\.css$/,
    use: [
      'style-loader',
      { loader: 'css-loader', options: { importLoaders: 1 } },
      'postcss-loader',
    ],
  });

  // 添加 NativeWind 處理錯誤的捕獲
  config.plugins.push({
    apply: (compiler) => {
      compiler.hooks.done.tap('NativeWindErrorHandler', (stats) => {
        if (stats.hasErrors()) {
          const info = stats.toJson();
          const nativewindErrors = info.errors.filter(error => 
            error.message && error.message.includes('nativewind')
          );
          
          if (nativewindErrors.length > 0) {
            console.warn('NativeWind errors detected:', nativewindErrors.length);
            // 但不中斷構建
          }
        }
      });
    },
  });

  return config;
};
