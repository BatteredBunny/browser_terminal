import fs from "fs";
import esbuild from "esbuild";
import path from "path";
import webExt from 'web-ext';
import { sassPlugin } from 'esbuild-sass-plugin';

// Recursively finds all files
function find(dir) {
    return fs.readdirSync(dir).map((f) => {
        let file = path.resolve(path.join(dir, f));
        if (fs.lstatSync(file).isDirectory()) {
            return find(file)
        } else {
            return file
        }
    }).reduce((a, b) => a.concat(b), [])
}

const SRC_DIR = "src";
const BUILD_DIR = "dist";
const WEB_EXT = "web-ext-artifacts";

const ESBUILD_OPTIONS = {
    entryPoints: find(SRC_DIR),
    bundle: true,
    outdir: BUILD_DIR,
    allowOverwrite: true,
    minify: true,
    loader: { ".json": "copy", ".png": "copy", ".html": "copy", ".ttf": "copy", ".DS_Store": "empty" },
    external: ['*.ttf'],
    plugins: [sassPlugin()]
}

const WEBEXT_OPTIONS = {
    sourceDir: path.resolve(BUILD_DIR),
    artifactsDir: path.resolve(WEB_EXT),
    noInput: true,
    overwriteDest: true,
}

async function dev_build() {
    ESBUILD_OPTIONS.minify = false
    let ctx = await esbuild.context(ESBUILD_OPTIONS);
    await ctx.watch()
}

try {
    fs.rmSync(BUILD_DIR, { recursive: true, force: true })
} catch (error) {

}

try {
    fs.mkdirSync(BUILD_DIR)
} catch (error) {

}

function patchManifest(type) {
    let chromium = '"service_worker": "/js/background.js"';
    let firefox = '"scripts": ["/js/background.js"]';

    let content = fs.readFileSync(SRC_DIR + "/manifest.json").toString();

    switch (type) {
        case "firefox":
            if (content.includes(chromium)) {
                content = content.replace(chromium, firefox)
                fs.writeFileSync(SRC_DIR + "/manifest.json", content, (err) => { if (err) throw err })
            }
            break
        case "chromium":
            if (content.includes(firefox)) {
                content = content.replace(firefox, chromium)
                fs.writeFileSync(SRC_DIR + "/manifest.json", content, (err) => { if (err) throw err })
            }
            break
    }
}

switch (process.argv[2]) {
    case "start:firefox":
    case "start":
        patchManifest("firefox")
        WEBEXT_OPTIONS.target = "firefox-desktop"
        await dev_build()
        await webExt.cmd.run(WEBEXT_OPTIONS, {})
        break
    case "start:chrome":
    case "start:chromium":
        patchManifest("chromium")
        WEBEXT_OPTIONS.target = "chromium"
        await dev_build()
        await webExt.cmd.run(WEBEXT_OPTIONS, {})
        break
    case "build:watch":
        await dev_build()
        break
    case "build:chromium":
        patchManifest("chromium")
        await esbuild.build(ESBUILD_OPTIONS)
        await webExt.cmd.build(WEBEXT_OPTIONS, {})
        break
    case "build":
        patchManifest("firefox")
        await esbuild.build(ESBUILD_OPTIONS)
        await webExt.cmd.build(WEBEXT_OPTIONS, {})
        break
    default:
        console.log("Invalid argument: Please choose either 'start' or 'build'")
}