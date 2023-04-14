const TERMINAL = document.getElementById("terminal");
const KILL_BUTTON = document.getElementById("kill_button");
const TERMINAL_FORM = document.getElementById("terminal_form");
const TERMINAL_INPUT = document.getElementById("terminal_input");

const EXTENSION_NAME = "browser_terminal";
let port = browser.runtime.connectNative(EXTENSION_NAME);

// history
let last_command = "";

// xterm stuff
let term = new Terminal();
const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
term.open(TERMINAL);
fitAddon.fit();

function send_message(command, signal) {
    if (signal) {
        port.postMessage({
            content: command,
            signal: signal
        });
    } else {
        port.postMessage({
            content: command,
        });
    }
}

port.onMessage.addListener((response) => {
    console.log(`"${response.content}"`);
    if (response.content) {
        term.writeln(response.content);
    }

    if (response.return_code) {
        if (response.return_code !== "0") {
            term.write(`[${response.return_code}] `);
        }

        term.write(`$ `);
    }
});

TERMINAL_FORM.addEventListener("submit", (e) => {
    e.preventDefault();
    let last_command = e.currentTarget.input.value;
    e.currentTarget.input.value = "";

    term.writeln(`$ ${last_command}`)
    send_message(last_command, '');
});

TERMINAL_INPUT.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
        if (last_command !== "") {
            let input = e.target;
            input.value = last_command;

            // TODO: move cursor to end somehow
            input.selectionStart = input.selectionEnd = input.value.length;
            input.focus()
        }
    }
})

KILL_BUTTON.addEventListener("click", () => {
    send_message("", 10)
})
