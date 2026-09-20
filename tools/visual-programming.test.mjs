import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const main = fs.readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
const render = fs.readFileSync(new URL('../src/game/render.js', import.meta.url), 'utf8');
const machine = fs.readFileSync(new URL('../src/game/machine.js', import.meta.url), 'utf8');

test('терминал показывает ту же очередь, которую Python меняет через while/pop/if', () => {
  assert.match(html, /id="programViz"/);
  assert.match(html, /id="programVizCells"/);
  assert.match(main, /ПОКА ЕСТЬ/);
  assert.match(main, /queue\.pop\(0\)/);
  assert.match(main, /programVizGate/);
});

test('визуальный указатель существует и в терминале, и прямо в игровом мире', () => {
  assert.match(main, /traceEntry\?\.boxId/);
  assert.match(render, /function drawProgramTraceWorld/);
  assert.match(render, /PYTHON · queue = \[ \.\.\. \] · WHILE/);
  assert.match(render, /IF → FALSE → ОСТАВИТЬ/);
});

test('python trace отделён от разрешённых world-events', () => {
  assert.match(machine, /trace\.visit/);
  assert.match(machine, /worldEvents = result\.events\.filter/);
  assert.match(machine, /validateWorldEvents\(worldEvents/);
});
