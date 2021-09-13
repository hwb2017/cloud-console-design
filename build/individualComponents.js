/* eslint-disable @typescript-eslint/no-var-requires */
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const pkg = require("../package.json");
const filesize = require("rollup-plugin-filesize");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const vuePlugin = require("rollup-plugin-vue");
const esbuild = require("rollup-plugin-esbuild");
const postcss = require("rollup-plugin-postcss");
const rollup = require("rollup");

const deps = Object.keys(pkg.dependencies)
const cwd = process.cwd();
const componentsDir = path.resolve(cwd, "./components");
const outputDir = path.resolve(cwd, "./dist");
const plugins = [
    postcss(),
    nodeResolve(),
    vuePlugin(),
    esbuild(),
];

(async () => {
    yellow("Start building individual components...");
    await buildComponents();
    green("Components built successfully");

    yellow('Start building entry file')
    await buildEntry()
    green('Entry built successfully')    
})()

async function getComponents() {
    const raw = await fs.promises.readdir(componentsDir);
    return raw
        .filter(f => f !== "style" && !f.endsWith(".ts"))
        .map(f => ({ path: path.resolve(componentsDir, f), name: f }))
}

async function reporter (opt, outputOptions, info) {
    const values = [
        info.fileName
        ? [`${outputOptions.file.split('components/').pop()}`]
        : [],
        [`${info.bundleSize}`],
        ...(info.minSize
        ?
        [`${info.minSize}`]
        : []),
    ]

    return `${
        chalk.cyan(chalk.bold(values[0]))
    }: bundle size ${
        chalk.yellow(values[1])
    } -> minified ${
        chalk.green(values[2])
    }`
}

async function buildComponents() {
    const componentsPaths = await getComponents();
    const builds = componentsPaths.map(async ({
        path: p,
        name: componentName,
    }) => {
        const entry = path.resolve(p, "./index.ts");
        if (!fs.existsSync(entry)) return;
        const external = (id) => {
            return /^vue/.test(id)
                || deps.some(k => new RegExp('^' + k).test(id))
        }
        const output = {
            format: "es",
            file: `${outputDir}/components/${componentName}/index.js`,
            plugins: [
                filesize({
                    reporter,
                })
            ]
        }
        const rollupConfig = {
            input: entry,
            plugins,
            external
        }
        const bundle = await rollup.rollup(rollupConfig);
        await bundle.write(output);
    })
    try {
        await Promise.all(builds)
    } catch(e) {
        logAndShutdown(e)
    }
}

async function buildEntry() {
    for (const entryFileName of ["index", "components"]) {
        const entry = path.resolve(componentsDir, `${entryFileName}.ts`);
        const rollupConfig = {
            input: entry,
            plugins,
            external: (id) => id !== entry
        }
        const output = {
            format: "es",
            file: `${outputDir}/components/${entryFileName}.js`,
            plugins: [
                filesize({
                    reporter,
                })
            ]
        }
        try {
            const bundle = await rollup.rollup(rollupConfig);
            await bundle.write(output);
        } catch(e) {
            logAndShutdown(e)
        }
    }
}

function yellow(str) {
    console.log(chalk.cyan(str))
}

function green(str) {
    console.log(chalk.green(str))
}

function red(str) {
    console.warn(chalk.red(str))
}

function logAndShutdown(e) {
    red(e.message)
    process.exit(1)
}