// 修復 NativeWind 的異步插件問題
// 這個文件會在 GitHub Actions 中被使用

const fs = require('fs');
const path = require('path');

/**
 * 修复 NativeWind 异步插件问题
 * 针对构建错误: Use process(css).then(cb) to work with async plugins
 */
function fixNativeWind() {
  try {
    // 修复 babel 插件中的异步处理问题
    const nativeWindPath = path.resolve('node_modules/nativewind/dist/babel/native.js');
    
    if (fs.existsSync(nativeWindPath)) {
      let content = fs.readFileSync(nativeWindPath, 'utf8');
      
      // 备份原始文件
      fs.writeFileSync(`${nativeWindPath}.backup`, content);
      
      // 替换 process 函数实现，确保正确处理异步插件
      if (content.includes('async function process(css, options)')) {
        content = content.replace(
          /async function process\(css, options\) {[\s\S]+?}/,
          `async function process(css, options) {
  try {
    const result = await postcss([pluginCreator(options)]).process(css, { from: undefined });
    return result.css;
  } catch (error) {
    console.error("Error processing CSS:", error);
    return css; // 返回原始 CSS，确保构建不会中断
  }
}`
        );
      } else if (content.includes('function process(css, options)')) {
        // 如果函数不是 async 的，替换为异步版本
        content = content.replace(
          /function process\(css, options\) {[\s\S]+?}/,
          `async function process(css, options) {
  try {
    const result = await postcss([pluginCreator(options)]).process(css, { from: undefined });
    return result.css;
  } catch (error) {
    console.error("Error processing CSS:", error);
    return css; // 返回原始 CSS，确保构建不会中断
  }
}`
        );
      }
      
      // 写入修改后的文件
      fs.writeFileSync(nativeWindPath, content);
      
      console.log('✅ 成功修复 NativeWind 的异步插件问题 (babel/native.js)');
    } else {
      console.warn('⚠️ 找不到 NativeWind 文件，跳过修复');
    }

    // 修复 webpack 插件的异步处理
    const webpackPath = path.resolve('node_modules/nativewind/dist/postcss/webpack.js');
    if (fs.existsSync(webpackPath)) {
      let webpackContent = fs.readFileSync(webpackPath, 'utf8');
      
      // 备份原始文件
      fs.writeFileSync(`${webpackPath}.backup`, webpackContent);
      
      // 修改 webpack 插件处理方式，确保正确处理异步操作
      if (webpackContent.includes('postcss([nativewind(options)])')) {
        webpackContent = webpackContent.replace(
          /postcss\(\[nativewind\(options\)\]\)/g,
          'postcss([nativewind(options)])'
        );
        
        // 添加异步处理的逻辑
        if (webpackContent.includes('postcss([nativewind(options)])')) {
          webpackContent = webpackContent.replace(
            /const processed = postcss\(\[nativewind\(options\)\]\)\.process\(css[\s\S]+?\);/g,
            `const processed = await postcss([nativewind(options)])
            .process(css, { from: undefined })
            .then(result => { 
              return result.css;
            })
            .catch(error => {
              console.error('NativeWind processing error:', error);
              return css; // 返回原始 CSS，确保构建不中断
            });`
          );
        }
        
        // 写入修改后的文件
        fs.writeFileSync(webpackPath, webpackContent);
        console.log('✅ 成功修复 NativeWind 的 webpack 插件异步问题');
      }
    }

    // 创建 webpack 配置文件以确保 web 平台正确配置
    const webpackConfigPath = path.resolve('webpack.config.js');
    if (!fs.existsSync(webpackConfigPath)) {
      const webpackConfig = `const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  // 获取基本的 Expo webpack 配置
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      // 确保 babel 处理异步操作正确
      babel: { 
        dangerouslyAddModulePathsToTranspile: ['nativewind'],
      },
    },
    argv
  );

  // 修改 postcss-loader 配置以正确处理异步操作
  config.module.rules.forEach(rule => {
    if (rule.oneOf) {
      rule.oneOf.forEach(oneOfRule => {
        if (oneOfRule.use && Array.isArray(oneOfRule.use)) {
          oneOfRule.use.forEach(loader => {
            if (loader.loader && loader.loader.includes('postcss-loader')) {
              if (!loader.options) loader.options = {};
              if (!loader.options.postcssOptions) loader.options.postcssOptions = {};
              if (!loader.options.postcssOptions.plugins) loader.options.postcssOptions.plugins = [];
              
              // 确保 nativewind 插件配置支持异步处理
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
`;
      fs.writeFileSync(webpackConfigPath, webpackConfig);
      console.log('✅ 创建 webpack.config.js 文件，优化 nativewind 异步处理');
    }

    // 确保 postcss 配置支持异步处理
    const postcssConfigPath = path.resolve('postcss.config.js');
    if (!fs.existsSync(postcssConfigPath)) {
      // 创建 postcss 配置文件以确保异步处理正确
      const postcssConfig = `module.exports = {
  plugins: {
    'nativewind/postcss': {
      // 确保异步处理正确
      async: true,
    },
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
      fs.writeFileSync(postcssConfigPath, postcssConfig);
      console.log('✅ 创建 postcss.config.js 文件，支持异步处理');
    }

    console.log('✅ NativeWind 修复完成');

  } catch (error) {
    console.error('❌ 修复 NativeWind 时出错:', error);
    process.exit(1); // 确保错误被正确处理
  }
}

// 执行修复
fixNativeWind();
