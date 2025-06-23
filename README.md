# browser terminal extension

Extension that allows you to open a native terminal in the browser. Tested on linux and macos. [Installation instructions](https://github.com/BatteredBunny/browser_terminal/blob/main/installation.md)

This project is mostly done as a joke and you should use an actual terminal emulator.

[firefox addons](https://addons.mozilla.org/en-US/firefox/addon/browser_terminal/), [chrome web store](https://chrome.google.cm/webstore/detail/browser-terminal/nbnfihffeffdhcbblmekelobgmdccfnl)

https://github.com/user-attachments/assets/16152edf-1446-478c-acd4-7168e4e20200

# Manual installation

## Installing unpacked extension to firefox

### 1. Install native manifest & build extension
```
yarn manifest:install
yarn build
```

### 2. Install extension to firefox
1. Navigate to ``about:debugging#/runtime/this-firefox``
2. Click ``Load temporary Add-on...``
3. Choose ``manifest.json`` in ``dist`` folder in the file picker

# Development

```bash
git clone https://github.com/BatteredBunny/browser_terminal
cd browser_terminal
yarn install
yarn start # or yarn start:chrome if on google chrome
```

After that click on the extension icon in browser

