import fs from "fs";
import path from "path";
import os from "os";

const __dirname = path.resolve(path.dirname(''));

const NATIVE_MANIFEST_PATHS = {
    "linux": {
        "firefox": "~/.mozilla/native-messaging-hosts/",
        "chrome": "~/.config/google-chrome/NativeMessagingHosts/",
        "chromium": "/.config/chromium/NativeMessagingHosts/",
    },

    "darwin": {
        "firefox": "~/Library/Application Support/Mozilla/NativeMessagingHosts/",
        "chrome": "~/Library/Application Support/Google/Chrome/NativeMessagingHosts/",
        "chromium": "~/Library/Application Support/Chromium/NativeMessagingHosts/",
    }
}

const NATIVE_APP_PATH = path.join(__dirname, "native", "app.py");

const MANIFEST = {
    "name": "browser_terminal",
    "description": "Extension that allows you to open a native shell in the browser",
    "path": NATIVE_APP_PATH,
    "type": "stdio",
    "allowed_origins": ["chrome-extension://ljjadcjbpfpnfgaomjlbamjddjamlcpf/"]
}

function manifest_path_build(manifest_path) {
    return path.join(manifest_path, MANIFEST.name + '.json').replace(/^~\//, os.homedir() + '/');
}

function get_manifest_path(browser) {
    let manifest_path = NATIVE_MANIFEST_PATHS[process.platform][browser]
    if (!manifest_path) {
        console.log("Unsupported browser or system")
        process.exit(1);
    }

    return manifest_path_build(manifest_path)
}

function install_manifest(path) {
    console.log(`Installing native manifest to "${path}"`)
    fs.writeFileSync(path, JSON.stringify(MANIFEST));
}

function uninstall_manifest(path) {
    console.log(`Removing native manifest from "${path}"`)
    fs.rmSync(path)
}

switch (process.argv[2]) {
    case "install:chrome":
        if (process.argv[3]) {
            MANIFEST.allowed_origins = [process.argv[3]]
        }
        install_manifest(get_manifest_path("chrome"))
        break
    case "install:chromium":
        if (process.argv[3]) {
            MANIFEST.allowed_origins = [process.argv[3]]
        }
        install_manifest(get_manifest_path("chromium"))
        break
    case "install:firefox":
    case "install":
        MANIFEST.allowed_extensions = ["browser_terminal@example.org"]
        MANIFEST.allowed_origins = undefined
        install_manifest(get_manifest_path("firefox"))
        break
    case "install:all":
        let install_paths = NATIVE_MANIFEST_PATHS[process.platform]
        if (!install_paths) {
            console.log("Unsupported system")
            process.exit(1)
        }

        for (let path of Object.values(install_paths)) {
            install_manifest(manifest_path_build(path))
        }
        break

    case "uninstall:chrome":
        uninstall_manifest(get_manifest_path("chrome"))
        break
    case "uninstall:chromium":
        uninstall_manifest(get_manifest_path("chromium"))
        break
    case "uninstall:firefox":
    case "uninstall":
        uninstall_manifest(get_manifest_path("firefox"))
        break
    case "uninstall:all":
        let uninstall_paths = NATIVE_MANIFEST_PATHS[process.platform]
        if (!uninstall_paths) {
            console.log("Unsupported system")
            process.exit(1)
        }

        for (let path of Object.values(uninstall_paths)) {
            uninstall_manifest(manifest_path_build(path))
        }
        break


    default:
        console.log("Invalid argument: Please choose either 'install' or 'uninstall'")
}
