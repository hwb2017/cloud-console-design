/* eslint-disable @typescript-eslint/no-var-requires */
const { runCmdSync } = require('./runCmd');
const rimraf = require('rimraf');
const path = require('path');
const cwd = process.cwd();
const packageVersion = require(path.join(cwd, 'package.json')).version;

function checkGit() {
    let { stdout } = runCmdSync('git', ['status', '--porcelain'])
    if (/^\?\?/m.test(stdout)) {
        throw new Error(`There are untracked files in the working tree.\n${stdout}`);
    }
    if (/^([ADRM]| [ADRM])/m.test(stdout)) {
        throw new Error(`There are uncommitted changes in the working tree.\n${stdout}`);
    }
}

function checkVersion() {
    if (!/^\d+\.\d+\.\d+$/.test(packageVersion)) {
        throw new Error(`The version ${packageVersion} in package.json is not valid.`);
    }
    let { stdout } = runCmdSync('npm', ['view', 'cloud-console-design', 'dist-tags.latest']);
    let oldVersion = stdout.trim();
    let packageVersionSections = packageVersion.split('.');
    let oldVersionSections = oldVersion.split('.');
    let sectionLenth = packageVersionSections.length;
    for (let i = 0; i < sectionLenth; i++) {
        if (packageVersionSections[i] > oldVersionSections[i]) break;
        if (packageVersionSections[i] < oldVersionSections[i]) {
            throw new Error(`The version ${packageVersion} in package.json should larger than latest npm tag`);
        }
        if (packageVersionSections[i] === oldVersionSections[i]) {
            if (i === sectionLenth - 1) {
                throw new Error(`The version ${packageVersion} in package.json should larger than latest npm tag`);
            } else {
                continue;
            }
        }
    }
}

function compile() {
    rimraf.sync(path.join(cwd, 'dist'));
    runCmdSync('npm', ['run', 'build']);
}

// function npmPublish() {
//     runCmdSync('npm', ['publish', cwd]);
// }

function gitTag() {
    runCmdSync('git', ['tag', packageVersion]);
}

function publish() {
    console.log("start check git status...");
    checkGit();
    console.log("start check package version");
    checkVersion();    
    console.log("start compile artifacts...");
    compile();
    // console.log("start npm publish...");
    // npmPublish();
    console.log("start create local git tag...");
    gitTag();
}

publish();