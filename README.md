# SelfFit - 運動日曆應用 

![版本](https://img.shields.io/badge/版本-1.0.0-blue)

## 📱 應用概述

SelfFit 是一款幫助用戶像安排會議一樣規劃和追蹤他們的運動活動的應用程序。透過將運動視為"與自己的約會"，SelfFit提高了用戶履行健康承諾的責任感。

### 📌 產品願景

現代人經常將與他人的約定視為優先，但忽略了與自己的約定。SelfFit 讓使用者以「預約行程」的方式安排運動目標，提升履行運動習慣的意識與責任感，從而養成健康生活。

### 🎯 使用者目標

- 方便地預約每週的運動計畫
- 運動安排像會議一樣出現在日曆中
- 在手機（iOS）與網頁端同步檢視與編輯
- 提醒功能幫助履行運動承諾
- 自訂運動類型與目標（如"慢跑30分鐘"、"瑜珈1小時"）

## 🔧 核心功能

1. **每週運動日曆排程**
   - 類Google Calendar的週視圖介面
   - 拖拉式建立運動事件（可選時間與時長）
   - 支援設定運動類型、時長、地點和備註

2. **行程提醒通知**
   - 行程開始前30分鐘推播提醒
   - 行程結束後手動記錄完成狀況

3. **個人目標追蹤**
   - 每週運動完成統計（完成次數、總時數）
   - 使用圖表呈現進度

4. **跨平台支援**
   - 支援iOS及網頁端
   - 資料本地存儲，未來支持雲端同步

5. **自訂運動項目管理**
   - 預設運動類型：慢跑、有氧、瑜珈、健身房
   - 用戶可新增自定義運動項目

## 🧪 技術堆疊

- **前端**: React Native (Expo)、React Navigation
- **Web支援**: Expo for Web
- **狀態管理**: Zustand
- **資料儲存**: AsyncStorage (MVP)，未來支援Firebase
- **推播通知**: Expo Notifications
- **UI框架**: NativeBase/TailwindCSS
- **日曆元件**: react-native-big-calendar

## 📥 安裝與啟動

```bash
# 克隆專案
git clone https://github.com/yanchen184/self-fit.git
cd self-fit

# 安裝依賴
npm install

# 啟動專案
npm start
```

## 🚀 在線演示

訪問 [https://yanchen184.github.io/self-fit](https://yanchen184.github.io/self-fit) 查看Web版應用示範。

## 📱 用戶流程

1. 開啟App → 進入本週日曆畫面
2. 點選時段 → 新增運動計畫
3. 計畫存入日曆 → 到時收到提醒
4. 行程結束 → 記錄是否完成運動
5. 回顧週運動成果 → 查看進度圖表

## 📈 開發路線

- **MVP** (v1.0.0): 基本日曆、運動記錄、本地存儲功能
- **未來計劃**:
  - 雲端同步 (Firebase/Supabase)
  - 用戶成就系統
  - 社交分享功能
  - 運動統計與分析報告

## 🧑‍💻 貢獻

歡迎提出issues和PR來幫助改進此專案！

## 📄 許可

此專案採用 MIT 許可 - 詳見 [LICENSE](LICENSE) 文件
