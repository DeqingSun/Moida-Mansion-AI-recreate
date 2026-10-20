const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {createGame} = require('./runtime.cjs');
function replay(seedTime) {
  const game = createGame({seedTime});
  assert.equal(game.segmentIds.length, 631);
  assert.equal(new Set(game.segmentIds).size, 631);
  const frames = [];
  for (let i = 0; i < 3000; i++) {
    // Released frames between presses are important: input is edge-triggered.
    const buttons = i > 30 && i % 13 === 0 ? [Math.floor(i / 13) % 4] : [];
    const frame = game.tick(buttons);
    assert.equal(frame.words.length, 20);
    assert(frame.litSegments.length <= 631);
    assert(Number.isFinite(frame.beeperHz));
    assert(frame.wakeAfterDelayInMs > 0);
    frames.push(frame);
  }
  return {game, frames};
}
const a = replay(1700000000000), b = replay(1700000000000);
assert.deepEqual(a.frames, b.frames, 'Same seed and input must reproduce every output');
const uniqueDisplays = new Set(a.frames.map(f => f.words.join(','))).size;
const beepFrames = a.frames.filter(f => f.beeperHz > 0).length;
assert(uniqueDisplays > 10, 'Exercise actual game progression');
assert(beepFrames > 0, 'Exercise melody output');
console.log(JSON.stringify({
  sourceSha256: a.game.sourceSha256,
  framesPerReplay: a.frames.length,
  identicalReplays: 2,
  uniqueDisplays, beepFrames,
  outputSha256: crypto.createHash('sha256').update(JSON.stringify(a.frames)).digest('hex'),
  note: 'Headless smoke/replay test, not full-game coverage or an MCU benchmark.',
}, null, 2));
