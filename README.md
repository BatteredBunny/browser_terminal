# browser terminal extension

Extension that allows you to open a native terminal in the browser. Tested in linux and macos. [Installation instructions](https://github.com/BatteredBunny/browser_terminal/blob/main/installation.md)

![screenshot.png](screenshot.png)

## Dependencies
   - golang
   - nodejs + npm/yarn

## Basic development usage

```bash
git clone https://github.com/BatteredBunny/browser_terminal
cd browser_terminal
yarn install
yarn start # or yarn start:chrome if on google chrome
```

After that click on the extension icon in browser

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
