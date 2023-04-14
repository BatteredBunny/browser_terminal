const TERMINAL = document.getElementById("terminal");
const KILL_BUTTON = document.getElementById("kill_button");

const EXTENSION_NAME = "browser_terminal";
let port = browser.runtime.connectNative(EXTENSION_NAME);

// history
let last_command = "";
let current_command = "";

// xterm stuff
let term = new Terminal({
    fontFamily: '"Fira Code", courier-new, courier, monospace, "Powerline Extra Symbols"'
});
const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
term.open(TERMINAL);

term.prompt = (return_code) => {
    if (return_code === undefined) {
        term.write('\r\n$ ');
    } else {
        term.write(`\r\n[${return_code}] $ `);
    }
};

term.prompt()
fitAddon.fit();

term.onKey((e) => {
    const ev = e.domEvent;
    const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

    if (ev.key === "Enter") {
        let last_command = current_command;
        console.log(last_command)
        current_command = "";
        send_command(last_command)

        term.prompt();
    } else if (ev.key === "Backspace") {
        // Do not delete the prompt
        if (term._core.buffer.x > 2) {
            term.write('\b \b');
            current_command = current_command.slice(0, -1)
        }
    } else if (ev.key === "ArrowUp") {
        // ev.preventDefault()
        // // TODO: go back in history
        // if (last_command !== "") {
        //     current_command = last_command;
        //     term.write(current_command)
        // }
    } else if (printable) {
        current_command += e.key;
        term.write(e.key);
    }
});

term.focus();

function send_command(command) {
    port.postMessage({
        command: command,
    });
}

function send_signal(signal) {
    port.postMessage({
        signal: signal
    });
}

// Receives response from native
port.onMessage.addListener((response) => {
    console.log(`"${response.content}"`);
    if (response.content) {
        term.writeln(response.content);
    }

    if (response.return_code) {
        if (response.return_code !== "0") {
            term.prompt(response.return_code)
        } else {
            term.prompt()
        }
    }
});

KILL_BUTTON.addEventListener("click", () => {
    send_signal(10)
})
