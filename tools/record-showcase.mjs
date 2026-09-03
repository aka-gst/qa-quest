import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const trash = join(root, 'trash');
mkdirSync(trash, { recursive: true });
const framesDir = mkdtempSync(join(trash, 'showcase-frames-'));
const showcaseDir = join(root, 'showcase');
const output = join(showcaseDir, 'quequest-manual-to-ai-10s.mp4');
mkdirSync(showcaseDir, { recursive: true });

const cdpPort = process.env.QUEQUEST_CDP_PORT || '9223';
const pages = await fetch(`http://127.0.0.1:${cdpPort}/json/list`).then((response) => response.json());
const page = pages.find((entry) => entry.type === 'page' && entry.url.includes('127.0.0.1:8765'));
if (!page) throw new Error('Открой QueQuest на http://127.0.0.1:8765 перед съёмкой.');

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let commandId = 0;
const pending = new Map();
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(JSON.stringify(message.error)));
  else resolve(message.result);
});

function cdp(method, params = {}) {
  const id = ++commandId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(expression, timeout = 20_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return;
    await pause(50);
  }
  throw new Error(`Не дождался состояния: ${expression}`);
}

async function snapshot() {
  return evaluate('window.__QUEQUEST_DEBUG__?.snapshot()');
}

async function key(type, code, keyValue) {
  await cdp('Input.dispatchKeyEvent', {
    type,
    code,
    key: keyValue,
    windowsVirtualKeyCode: keyValue.length === 1 ? keyValue.toUpperCase().charCodeAt(0) : 32,
    nativeVirtualKeyCode: keyValue.length === 1 ? keyValue.toUpperCase().charCodeAt(0) : 32,
  });
}

async function tap(code, keyValue) {
  await key('keyDown', code, keyValue);
  await pause(45);
  await key('keyUp', code, keyValue);
  await pause(160);
}

async function moveX(target) {
  const start = await snapshot();
  const right = target > start.player.x;
  const code = right ? 'KeyD' : 'KeyA';
  const value = right ? 'd' : 'a';
  await key('keyDown', code, value);
  try {
    const started = Date.now();
    while (Date.now() - started < 8_000) {
      const current = await snapshot();
      if ((right && current.player.x >= target) || (!right && current.player.x <= target)) return;
      await pause(20);
    }
    throw new Error(`Герой не дошёл до x=${target}`);
  } finally {
    await key('keyUp', code, value);
    await pause(120);
  }
}

async function click(selector) {
  const point = await evaluate(`(() => {
    const rect = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();
    return {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
  })()`);
  await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
  await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
}

await cdp('Page.enable');
await cdp('Runtime.enable');
await cdp('Emulation.setDeviceMetricsOverride', {
  width: 1280,
  height: 720,
  deviceScaleFactor: 1,
  mobile: false,
});
await evaluate(`localStorage.setItem('quequest.game.v1', JSON.stringify({version:1, checkpoint:'warehouse'}))`);
await cdp('Page.navigate', { url: 'http://127.0.0.1:8765/?quiet&showcase=1' });
await waitFor(`document.readyState === 'complete' && window.__QUEQUEST_DEBUG__?.snapshot().scene === 'warehouse'`);
await pause(500);

let recordingActive = true;
let frame = 0;
const recordingStarted = performance.now();
const recordingTask = (async () => {
  while (recordingActive) {
    const shot = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 76, fromSurface: true });
    frame += 1;
    writeFileSync(join(framesDir, `frame-${String(frame).padStart(5, '0')}.jpg`), Buffer.from(shot.data, 'base64'));
    await pause(40);
  }
})();

for (const crateX of [265, 205, 325]) {
  await moveX(crateX);
  await tap('Space', ' ');
  const carrying = await snapshot();
  if (!carrying.player.carrying) throw new Error(`Ящик у x=${crateX} не поднят`);
  await moveX(1300);
  await tap('Space', ' ');
}

await waitFor(`window.__QUEQUEST_DEBUG__.snapshot().scene === 'machine'`);
await pause(500);
await click('#runCode');
await waitFor(`window.__QUEQUEST_DEBUG__.snapshot().scene === 'automation'`, 30_000);
await waitFor(`!document.querySelector('#runCode').disabled`);
await evaluate(`document.querySelector('#codeInput').value = 'for box in boxes:\\n    arm.move(box, pallet)'`);
await pause(500);
await click('#runCode');
await waitFor(`window.__QUEQUEST_DEBUG__.snapshot().arm.active || window.__QUEQUEST_DEBUG__.snapshot().arm.queue.length > 0`);

await key('keyDown', 'KeyW', 'w');
await pause(1_500);
await key('keyUp', 'KeyW', 'w');
await key('keyDown', 'KeyA', 'a');
await pause(1_100);
await key('keyUp', 'KeyA', 'a');

await waitFor(`window.__QUEQUEST_DEBUG__.snapshot().scene === 'red-crate'`, 15_000);
await pause(800);
recordingActive = false;
await recordingTask;

const durationMs = Math.round(performance.now() - recordingStarted);
const final = await snapshot();
socket.close();

const encode = spawnSync('ffmpeg', [
  '-y', '-v', 'error',
  '-framerate', String(frame / 10),
  '-i', join(framesDir, 'frame-%05d.jpg'),
  '-vf', 'fps=30,format=yuv420p',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '24',
  '-movflags', '+faststart', '-an', output,
], { encoding: 'utf8' });
if (encode.status !== 0) throw new Error(encode.stderr || `ffmpeg завершился с кодом ${encode.status}`);

console.log(JSON.stringify({ output, framesDir, frames: frame, durationMs, final }, null, 2));
