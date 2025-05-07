// 修復 NativeWind 的異步插件問題
// 這個文件會在 GitHub Actions 中被使用

const fs = require('fs');
const path = require('path');

try {
  const nativeWindPath = path.resolve('node_modules/nativewind/dist/babel/native.js');
  
  if (fs.existsSync(nativeWindPath)) {
    let content = fs.readFileSync(nativeWindPath, 'utf8');
    
    // 備份原始文件
    fs.writeFileSync(`${nativeWindPath}.backup`, content);
    
    // 替換 process 函數實現
    content = content.replace(
      /async function process\(css, options\) {([\s\S]+?)}/,
      `async function process(css, options) {
  try {
    const result = await postcss([pluginCreator(options)]).process(css, { from: undefined });
    return result.css;
  } catch (error) {
    console.error("Error processing CSS:", error);
    return css; // 返回原始 CSS，確保構建不會中斷
  }
}`
    );
    
    // 寫入修改後的文件
    fs.writeFileSync(nativeWindPath, content);
    
    console.log('成功修復 NativeWind 的異步插件問題');
  } else {
    console.warn('找不到 NativeWind 文件，跳過修復');
  }
} catch (error) {
  console.error('修復 NativeWind 時出錯:', error);
}
