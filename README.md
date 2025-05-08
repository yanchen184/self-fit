# SelfFit 健身追蹤應用

![版本](https://img.shields.io/badge/版本-1.0.2-blue)
![構建狀態](https://img.shields.io/github/actions/workflow/status/yanchen184/self-fit/deploy.yml?branch=main)

SelfFit 是一個簡單易用的健身追蹤應用，幫助你記錄和管理你的健身活動。

## 🌐 在線演示

訪問 [SelfFit 在線演示](https://yanchen184.github.io/self-fit) 查看應用。

## ✨ 功能

- 健身活動追蹤
- 健身日曆視圖
- 訓練計劃管理
- 通知提醒功能
- 適配移動端和網頁端

## 🛠️ 技術棧

- React Native / React Native Web
- Expo
- NativeWind (TailwindCSS)
- React Navigation
- Zustand (狀態管理)
- 日期處理: date-fns, dayjs

## 🚀 本地開發

### 安裝依賴

```bash
# 安裝依賴
npm install --legacy-peer-deps

# 如果遇到 NativeWind 問題，運行修復腳本
npm run fix-nativewind
```

### 啟動開發服務器

```bash
# 啟動
npm start

# 僅啟動 Web 版本
npm run web

# 構建 Web 版本
npm run build:web
```

## 📱 移動版本

應用同時支持 iOS 和 Android 平台：

```bash
# iOS
npm run ios

# Android
npm run android
```

## 🤝 貢獻

歡迎提交 issues 和 pull requests 來幫助改進這個項目。

## 📝 版本歷史

### v1.0.2
- 修復 NativeWind 異步插件問題
- 添加 Web 平台配置
- 優化 GitHub Actions 構建流程

### v1.0.1
- 初始版本
- 基本功能實現
