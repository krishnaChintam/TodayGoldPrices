const { spawn } = require('child_process');
const path = require('path');

const apiPort = process.env.API_PORT || '3001';
const webPort = process.env.PORT || '3000';

console.log(`Starting Gold Tracker API server on http://localhost:${apiPort} ...`);
const apiProc = spawn(process.execPath, [path.join(__dirname, 'server.js')], {
  env: { ...process.env, PORT: apiPort },
  stdio: 'inherit'
});

const viteBin = path.join(
  __dirname,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'vite.cmd' : 'vite'
);

console.log(`Starting React dev server on http://localhost:${webPort} ...`);
const webProc = spawn(viteBin, ['--config', 'vite.config.mjs', '--port', webPort], {
  env: { ...process.env },
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

function shutdown() {
  if (!apiProc.killed) apiProc.kill();
  if (!webProc.killed) webProc.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

webProc.on('exit', (code) => {
  if (!apiProc.killed) apiProc.kill();
  process.exit(code || 0);
});
