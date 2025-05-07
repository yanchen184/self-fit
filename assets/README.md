# SelfFit 應用資源文件

本資料夾包含 SelfFit 應用的所有靜態資源文件，如圖標、啟動畫面和字體等。

## 文件結構

- `icon.png`: 應用主圖標
- `splash.png`: 應用啟動畫面
- `adaptive-icon.png`: Android 適配圖標
- `favicon.png`: Web版的網頁圖標
- `notification-icon.png`: 通知圖標

## 使用說明

當需要替換或更新資源文件時，請確保新文件與原文件的尺寸和格式相同，以確保應用在各平台上的正常顯示。

### 圖標尺寸要求

- `icon.png`: 1024x1024 px, PNG格式
- `splash.png`: 2048x2048 px, PNG格式
- `adaptive-icon.png`: 1024x1024 px, PNG格式
- `favicon.png`: 196x196 px, PNG格式
- `notification-icon.png`: 96x96 px, PNG格式

## 在app.json中的配置

資源文件在app.json中配置，確保路徑正確指向此資料夾中的相應文件。例如：

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    ...
  }
}
```

## 版權聲明

所有圖標和資源文件的設計和使用應遵循相關版權規定。
