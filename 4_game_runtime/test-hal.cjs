const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'moida-hal-'));
try {
  const exe = path.join(dir, 'hal-probe');
  const sources = ['moida_core', 'moida_text', 'moida_room', 'moida_layout',
    'moida_puzzle', 'moida_house', 'moida_game', 'moida_hal', 'hal_probe'];
  const build = spawnSync(process.env.CC || 'cc', ['-std=c11', '-Wall', '-Wextra',
    '-Werror', '-fsanitize=address,undefined',
    ...sources.map(f => path.join(__dirname, 'native', f + '.c')), '-o', exe], {encoding:'utf8'});
  assert.equal(build.status, 0, build.stderr);
  const run = spawnSync(exe, [], {encoding:'utf8'});
  assert.equal(run.status, 0, run.stderr);
  process.stdout.write(run.stdout);
} finally {
  fs.rmSync(dir, {recursive:true, force:true});
}
