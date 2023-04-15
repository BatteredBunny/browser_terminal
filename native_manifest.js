const fs = require('fs');
const path = require("path");
const os = require("os");

const LINUX_PATH = "~/.mozilla/native-messaging-hosts/";
const DARWIN_PATH = "~/Library/Application Support/Mozilla/NativeMessagingHosts/";

const NATIVE_APP_PATH = path.join(__dirname, "native", "app.py");

const MANIFEST = {
    "name": "browser_terminal",
    "description": "Allows you to open a native shell in the browser",
    "path": NATIVE_APP_PATH,
    "type": "stdio",
    "allowed_extensions": ["browser_terminal@example.org"]
}

function get_manifest_path() {
    switch (process.platform) {
        case "darwin":
            return path.join(DARWIN_PATH, MANIFEST.name + '.json').replace(/^~\//, os.homedir() + '/');
        case "linux":
            return path.join(LINUX_PATH, MANIFEST.name + '.json').replace(/^~\//, os.homedir() + '/');
        default:
            console.log("Unsupported system")
            process.exit(1);
    }
}

switch (process.argv[2]) {
    case "install":
        let install_location = get_manifest_path()
        console.log(`Installing native manifest to "${install_location}"`)
        fs.writeFileSync(install_location, JSON.stringify(MANIFEST));
        break
    case "uninstall":
        let uninstall_location = get_manifest_path()
        console.log(`Removing native manifest from "${uninstall_location}"`)
        fs.rmSync(uninstall_location)
        break
    default:
        console.log("Invalid argument: Please choose either 'install' or 'uninstall'")
}
