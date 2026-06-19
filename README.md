# Tab

To make it easier for you to manage browser tab pages.

English | [中文](./README_ZH.md)

## Installion

[Chrome Web Store](https://chrome.google.com/webstore/detail/tab/jjihajofddejmecdigfhddjkondfjkgf)

[Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tab/lppkpnfehnnoafamddghlofdchbacomh)

## Usage

### Quickly Switch Browser Tabs

![switch tab](./switchTab.gif)

### Quickly Switch Browser Windows

![switch window](./switchWindow.gif)

### Quickly Close Browser Tabs

![close tab](./closeTab.gif)

### Quickly Close Browser Windows

![close window](./closeWindow.gif)

### Quickly Save Browser Tabs

![save tab](./saveTab.gif)

### Quickly Save Browser Windows

![save window](./saveWindow.gif)

### View Recently Closed Pages

![history](./history.gif)

## Tech Stack

- [Vite+](https://viteplus.dev/guide/) as the unified web toolchain and `vp` CLI.
- [Vue](https://vuejs.org/) for the extension UI.
- [Vuetify](https://vuetifyjs.com/) for UI components.
- [TypeScript](https://www.typescriptlang.org/) for typed application code.

## Runtime

- Node.js: `24.17.0`
- Package manager: `pnpm@11.5.2`
- Vite+ reads these settings from `package.json`.

First-time runtime setup:

```bash
vp env setup
vp env on
vp env install
```

## Development

Install dependencies:

```bash
vp install
```

Build in watch mode for extension development:

```bash
vp dev
```

The unpacked extension output is written to `dist/`.

## Build

Run the project build script through Vite+. This runs Vue type checking and the Vite+ production build in parallel:

```bash
vp run build
```

Use `vp build` only when you want to run the built-in Vite+ production build directly without the project script.

The production build outputs the Chrome extension files:

```text
dist/manifest.json
dist/popup.html
dist/save.html
dist/service.js
```

## Validation

```bash
vp check
```

Run `vp help` to see the full list of Vite+ commands, or `vp <command> --help` for command-specific help.

## License

[GPL-3.0](LICENSE)
