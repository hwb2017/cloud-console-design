/* eslint-disable @typescript-eslint/no-var-requires */
function runCmd(cmd, _args, cb) {
    const args = _args || [];
    const runner = require('child_process').spawn(cmd, args, {
        shell: true,
        encoding: 'utf8'
    });
    let cmdOutput = "";
    runner.stdout.on('data', (data) => {
        data = data.toString();
        cmdOutput += data;
    });
    runner.stderr.on('data', (data) => {
        data = data.toString();
        cmdOutput += data;
    });
    runner.on('close', code => {
        if (cb) {
            cb(code, cmdOutput);
        }
    });
}

function runCmdSync(cmd, _args) {
    const args = _args || [];
    const runner = require('child_process').spawnSync(cmd, args, {
        shell: true,
        encoding: 'utf8'
    });
    if (runner.error) {
        throw runner.error;
    }
    return runner;
}

module.exports = {
    runCmd,
    runCmdSync
};