# Installation

1. Install extension from [firefox addons](https://addons.mozilla.org/en-US/firefox/addon/browser_terminal/) or [chrome web store](https://chrome.google.cm/webstore/detail/browser-terminal/nbnfihffeffdhcbblmekelobgmdccfnl)

2. Download native program from https://github.com/BatteredBunny/browser_terminal/releases
3. Installing the binary
    - Linux: ``sudo mv ~/Downloads/browser_terminal_linux /usr/local/bin/browser_terminal``
    - MacOS: ``sudo mv ~/Downloads/browser_terminal_macos  /usr/local/bin/browser_terminal``
4. Install the native manifest: ```browser_terminal --install```

Done!

# Nix users
Nix users on linux and macos can take advantage of the flake in the repo to install the binary (`nix run github:BatteredBunny/browser_terminal#native`)