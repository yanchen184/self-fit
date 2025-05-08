const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  // 獲取基本的 Expo webpack 配置
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      // 確保 babel 處理異步操作正確
      babel: { 
        dangerouslyAddModulePathsToTranspile: ['nativewind'],
      },
    },
    argv
  );

  // 修改 postcss-loader 配置以正確處理異步操作
  config.module.rules.forEach(rule => {
    if (rule.oneOf) {
      rule.oneOf.forEach(oneOfRule => {
        if (oneOfRule.use && Array.isArray(oneOfRule.use)) {
          oneOfRule.use.forEach(loader => {
            if (loader.loader && loader.loader.includes('postcss-loader')) {
              if (!loader.options) loader.options = {};
              if (!loader.options.postcssOptions) loader.options.postcssOptions = {};
              if (!loader.options.postcssOptions.plugins) loader.options.postcssOptions.plugins = [];
              
              // 確保 nativewind 插件配置支持異步處理
              loader.options.postcssOptions.plugins = loader.options.postcssOptions.plugins.map(plugin => {
                if (typeof plugin === 'string' && plugin.includes('nativewind')) {
                  return ['nativewind/postcss', { async: true }];
                }
                return plugin;
              });
            }
          });
        }
      });
    }
  });

  return config;
};
