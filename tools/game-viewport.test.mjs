import test from 'node:test';
import assert from 'node:assert/strict';

import { getViewportTransform, screenToWorld } from '../src/game/viewport.js';

test('широкий экран показывает весь мир без обрезки', () => {
  const transform = getViewportTransform({ width: 1280, height: 720 }, { x: 800, y: 720 });
  assert.deepEqual(transform, { scale: 0.8, offsetX: 0, offsetY: 0 });
});

test('телефон заполняет игрой высоту и держит героя в центре', () => {
  const transform = getViewportTransform({ width: 390, height: 844 }, { x: 800, y: 720 });
  assert.ok(transform.scale > 0.93);
  assert.ok(Math.abs(800 * transform.scale + transform.offsetX - 195) < 0.01);
  assert.equal(transform.offsetY, 0);
});

test('клик на телефоне переводится обратно в координаты мира', () => {
  const viewport = { width: 390, height: 844 };
  const player = { x: 1010, y: 580 };
  const transform = getViewportTransform(viewport, player);
  const point = screenToWorld({ x: 195, y: 350 * transform.scale }, transform);
  assert.ok(Math.abs(point.x - 1010) < 0.01);
  assert.ok(Math.abs(point.y - 350) < 0.01);
});
