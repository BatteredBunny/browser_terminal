# browser-terminal-extension

Extension that allows you to open a native terminal in the browser. Tested in linux and macos.

![screenshot.png](screenshot.png)

## Dependencies
   - golang
   - nodejs + npm/pnpm

## Basic development usage

```bash
git clone https://github.com/ayes-web/browser-terminal-extension
cd browser-terminal-extension
pnpm install
pnpm start # or pnpm start:chrome if on google chrome
```

After that click on the extension icon in browser

## Installing unpacked extension to firefox

### 1. Install native manifest & build extension
```
pnpm native-manifest install
pnpm build
```

### 2. Install extension to firefox
1. Navigate to ``about:debugging#/runtime/this-firefox``
2. Click ``Load temporary Add-on...``
3. Choose ``dist`` folder in the file picker
