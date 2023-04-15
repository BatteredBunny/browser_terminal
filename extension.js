import fs from "fs";
import esbuild from "esbuild";
import path from "path";
import webExt from 'web-ext';

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

const ESBUILD_OPTIONS = {
    entryPoints: find(SRC_DIR),
    bundle: true,
    outdir: BUILD_DIR,
    allowOverwrite: true,
    minify: true,
    loader: {".json": "copy", ".png": "copy", ".html": "copy"},
}

const WEBEXT_OPTIONS = {
    sourceDir: path.resolve(BUILD_DIR),
}

async function dev_build() {
    ESBUILD_OPTIONS.minify = false
    let ctx = await esbuild.context(ESBUILD_OPTIONS);
    await ctx.watch()
}

switch (process.argv[2]) {
    case "start":
        WEBEXT_OPTIONS.target = "firefox-desktop"
        await dev_build()
        await webExt.cmd.run(WEBEXT_OPTIONS, {})
        break
    case "start:chrome":
    case "start:chromium":
        WEBEXT_OPTIONS.target = "chromium"
        await dev_build()
        await webExt.cmd.run(WEBEXT_OPTIONS, {})
        break
    case "build:watch":
        await dev_build()
        break
    case "build":
        await esbuild.build(ESBUILD_OPTIONS)
        // await webExt.cmd.build(WEBEXT_OPTIONS, {})
        break
    default:
        console.log("Invalid argument: Please choose either 'start' or 'build'")
}