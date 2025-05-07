# SelfFit 開發指南

## 項目概述

SelfFit 是一款運動日曆應用，幫助用戶以「預約行程」的方式安排運動計劃，提升履行運動習慣的意識與責任感。應用提供iOS和Web兩個平台的支持。

## 開發環境設置

1. **安裝依賴**

   ```bash
   # 克隆專案
   git clone https://github.com/yanchen184/self-fit.git
   cd self-fit

   # 安裝依賴
   npm install
   ```

2. **啟動開發環境**

   ```bash
   # 啟動開發服務器
   npm start
   ```

   - 對於iOS: 使用Expo Go應用掃描QR碼
   - 對於Web: 訪問 http://localhost:19006

## 項目結構

```
self-fit/
├── assets/                # 應用資源文件
├── src/
│   ├── components/        # 可重用組件
│   ├── navigation/        # 導航配置
│   ├── screens/           # 頁面組件
│   ├── stores/            # 狀態管理
│   └── types/             # TypeScript類型定義
├── web/                   # Web特定文件
│   ├── index.html         # Web入口HTML
│   └── manifest.json      # Web應用配置
├── App.tsx                # 主應用入口
├── app.json               # Expo配置
├── babel.config.js        # Babel配置
└── tailwind.config.js     # TailwindCSS配置
```

## 主要功能

1. **每週運動日曆排程**
   - 使用`CalendarScreen.tsx`實現週視圖
   - 拖拉/點擊操作由`react-native-big-calendar`處理

2. **添加/編輯運動計劃**
   - `AddWorkoutScreen.tsx`和`EditWorkoutScreen.tsx`實現表單操作
   - 表單數據通過`workoutStore.ts`進行狀態管理和持久化

3. **運動類型管理**
   - `WorkoutTypesScreen.tsx`和`EditWorkoutTypeScreen.tsx`實現類型管理
   - 類型數據通過`appStore.ts`管理和持久化

4. **統計功能**
   - `StatsScreen.tsx`負責數據可視化
   - 使用`CircleChart.tsx`組件展示完成率等數據

5. **設置功能**
   - `SettingsScreen.tsx`實現用戶偏好設置
   - 設置數據通過`appStore.ts`管理和持久化

## 數據管理

應用使用Zustand進行狀態管理，並使用AsyncStorage進行數據持久化。主要包括兩個存儲：

1. **appStore**: 管理應用設置和運動類型
2. **workoutStore**: 管理運動計劃數據和操作

## 通知實現

應用使用Expo的通知功能在運動開始前發送提醒：

```tsx
// 通知配置在workoutStore.ts中
scheduleWorkoutNotification(workout) {
  // ...設置通知內容和時間
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '運動提醒',
      body: `${workout.title} 即將開始`,
      // ...
    },
    trigger: notificationTime,
  });
}
```

## Web部署

應用使用GitHub Actions自動部署到GitHub Pages:

1. 每次推送到main分支會觸發部署
2. 構建過程在`.github/workflows/deploy.yml`中定義

## 擴展計劃

1. **Firebase雲端同步**
   - 將AsyncStorage替換為Firestore
   - 添加用戶認證功能

2. **成就系統**
   - 添加完成連續天數的獎勵機制
   - 實現進度徽章功能

3. **社交分享功能**
   - 添加運動計劃和成果分享
   - 好友挑戰功能

## 貢獻指南

1. Fork專案
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 創建Pull Request

## 許可

本專案採用MIT許可證。
