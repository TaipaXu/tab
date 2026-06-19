# Tab

让你更方便地管理浏览器tab页。

[English](./README.md) | 中文

## 安装

[Chrome应用商店](https://chrome.google.com/webstore/detail/tab/jjihajofddejmecdigfhddjkondfjkgf)

[Edge插件商店](https://microsoftedge.microsoft.com/addons/detail/tab/lppkpnfehnnoafamddghlofdchbacomh)

## 使用

### 快速切换浏览器标签页

![switch tab](./switchTab.gif)

### 快速切换浏览器窗口

![switch window](./switchWindow.gif)

### 快速关闭浏览器标签页

![close tab](./closeTab.gif)

### 快速关闭浏览器窗口

![close window](./closeWindow.gif)

### 快速保存浏览器标签页

![save tab](./saveTab.gif)

### 快速保存浏览器窗口

![save window](./saveWindow.gif)

### 查看最近关闭的页面

![history](./history.gif)

## 技术栈

- [Vite+](https://viteplus.dev/guide/) 作为统一 Web 工具链和 `vp` CLI。
- [Vue](https://vuejs.org/) 用于扩展界面。
- [Vuetify](https://vuetifyjs.com/) 用于 UI 组件。
- [TypeScript](https://www.typescriptlang.org/) 用于类型化应用代码。

## 运行环境

- Node.js：`24.17.0`
- 包管理器：`pnpm@11.5.2`
- Vite+ 会从 `package.json` 读取这些设置。

首次运行时设置：

```bash
vp env setup
vp env on
vp env install
```

## 开发

安装依赖：

```bash
vp install
```

以 watch 模式构建，供扩展开发使用：

```bash
vp dev
```

未打包扩展输出在 `dist/` 目录。

## 打包

通过 Vite+ 运行项目构建脚本。该命令会并行执行 Vue 类型检查和 Vite+ 生产构建：

```bash
vp run build
```

只有在需要直接运行 Vite+ 内置生产构建、跳过项目构建脚本时，才使用 `vp build`。

生产构建会输出 Chrome 扩展文件：

```text
dist/manifest.json
dist/popup.html
dist/save.html
dist/service.js
```

## 校验

```bash
vp check
```

也可以运行 `vp help` 查看 Vite+ 提供的完整命令列表，或运行 `vp <command> --help` 查看单个命令的帮助。

## 协议

[GPL-3.0](LICENSE)
