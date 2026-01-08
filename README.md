# Chrome Extensions Workspace

本目录包含一系列 Chrome 扩展程序的源代码。以下是关于 Chrome 扩展开发的基础知识和本工作区的开发指南。

## 目录结构
通常每个子目录对应一个独立的 Chrome Extension 项目。
目前包含的项目：
- `quick_translation/`: (如果是现有项目) 快速翻译扩展示例

## Chrome 扩展程序基础 (Manifest V3)
所有新开发的扩展程序必须遵循 **Manifest V3** 规范。

### 核心文件
每个扩展程序至少包含一个 `manifest.json` 文件：
```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0",
  "description": "A brief description",
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icon.png"
  },
  "background": {
    "service_worker": "background.js"
  },
  "permissions": ["activeTab", "storage"]
}
```

### 关键组件
1. **Manifest (`manifest.json`)**: 扩展的配置文件，定义权限、入口和资源。
2. **Background Script (Service Worker)**: 处理扩展的后台逻辑，基于事件驱动 (Manifest V3 使用 Service Worker)。
3. **Content Scripts**: 运行在网页上下文中，可以读取和修改网页通过 DOM。
4. **Popup / Options UI**: 用户界面，通常由 HTML/CSS/JS 组成。

## 开发与调试
1. 打开 Chrome 浏览器，访问 `chrome://extensions/`。
2. 打开右上角的 **开发者模式 (Developer mode)** 开关。
3. 点击 **加载已解压的扩展程序 (Load unpacked)**。
4. 选择具体的项目子目录（例如 `quick_translation`）进行加载。

## 常用资源
- [Chrome Extensions Documentation (Official)](https://developer.chrome.com/docs/extensions/mv3/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-migration/)
