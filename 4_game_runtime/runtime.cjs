// Runs the original Nim-generated logic; only the browser bootstrap is disabled.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const sourcePath = path.resolve(__dirname, '../1_preliminary_routing/source/moida.js');
function loadOriginal({seedTime = 1700000000000} = {}) {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const bootstrap = 'run__device95html_u798({tickFunc:tick__main_u41,pauseWhenUnfocused:!1})';
  if (source.split(bootstrap).length !== 2) throw Error('Original bootstrap changed; review adapter');
  let now = seedTime;
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const context = vm.createContext({
    Date: Clock,
    console: {log() {}},
    // Sound objects are constructed at startup but are never used by game logic.
    Howl: function () {}, Howler: {volume() {}},
    // Optional debug-console lookup; no DOM/display implementation.
    document: {getElementById() { return null; }},
  });
  vm.runInContext(source.replace(bootstrap, 'void 0'), context, {timeout: 10000});
  return {context, source, advanceClock(ms) { now += ms; }};
}
function createGame(options) {
  const {context, source, advanceClock} = loadOriginal(options);
  const ids = vm.runInContext('segIds_721420499.map(x=>String.fromCharCode(...x))', context);
  let previous = {};
  return {
    sourceSha256: crypto.createHash('sha256').update(source).digest('hex'),
    segmentIds: Array.from(ids),
    tick(buttons = [], elapsedMs = 100) {
      if (!buttons.every(n => Number.isInteger(n) && n >= 0 && n <= 3)) throw Error('Button IDs must be 0..3');
      advanceClock(elapsedMs);
      const current = Object.fromEntries(buttons.map(n => [n, true]));
      context.hostInput = {curButtonIds: current, preButtonIds: previous};
      const output = vm.runInContext('tick__main_u41(hostInput)', context, {timeout: 1000});
      previous = current;
      const words = Array.from(output.spriteState.data);
      return {
        words,
        litSegments: Array.from(ids).filter((_, i) => (words[i >>> 5] >>> (i & 31)) & 1),
        beeperHz: output.beeperHz,
        beeperDurationInMs: output.beeperDurationInMs,
        wakeAfterDelayInMs: output.wakeAfterDelayInMs,
        wakeOnButtonIds: Object.keys(output.wakeOnButtonIds).map(Number),
        progressMarker: output.progressMarker,
      };
    },
  };
}
module.exports = {createGame, loadOriginal};
