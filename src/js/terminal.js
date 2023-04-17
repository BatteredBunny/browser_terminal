import { Terminal } from "xterm";
import { WebLinksAddon } from "xterm-addon-web-links";
import browser from "webextension-polyfill";

const TERMINAL = document.getElementById("terminal");
const BANNER = document.getElementById("banner");
const KILL_BUTTON = document.getElementById("kill_button");

const EXTENSION_NAME = "browser_terminal";
let port = browser.runtime.connectNative(EXTENSION_NAME);

port.onDisconnect.addListener(() => {
    BANNER.classList.add("red-banner")
})

// xterm stuff
let term = new Terminal({
    fontFamily: '"FiraCode Nerd Font Mono", courier-new, courier, monospace'
});

term.loadAddon(new WebLinksAddon());
term.open(TERMINAL);

term.onKey((e) => send_command(e.key));

term.focus();

function send_message(json) {
    port.postMessage(json)
}

function send_command(command) {
    send_message({
        command: command,
    });
}

function send_signal(signal) {
    send_message({
        signal: signal
    });
}

// Receives response from native
port.onMessage.addListener((response) => {
    console.log(`Received: "${JSON.stringify(response)}"`);
    if (response.c) {
        term.write(response.c);
    }
});

KILL_BUTTON.addEventListener("click", () => {
    send_signal(10)
})
