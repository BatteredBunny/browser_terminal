chrome.browserAction.onClicked.addListener(async () => {
    await chrome.tabs.create({ url: chrome.extension.getURL("/html/terminal.html") });
})