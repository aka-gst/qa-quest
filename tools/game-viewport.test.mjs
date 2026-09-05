import test from 'node:test';
import assert from 'node:assert/strict';

import { getSceneCameraTarget, getViewportTransform, screenToWorld } from '../src/game/viewport.js';

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

test('авария руки на телефоне держит в кадре красный ящик и захват машины', () => {
  const viewport = { width: 390, height: 844 };
  const state = {
    scene: 'automation',
    player: { x: 1120, y: 580 },
    arm: { failure: { phase: 'scan', progress: 0.35 } },
    warehouse: { crates: [{ id: 'red-01', x: 720, y: 575, status: 'scan' }] },
  };

  const target = getSceneCameraTarget(state);
  const transform = getViewportTransform(viewport, target);
  const left = screenToWorld({ x: 0, y: 0 }, transform).x;
  const right = screenToWorld({ x: viewport.width, y: 0 }, transform).x;

  assert.ok(left <= 640, `скан красного ящика обрезан слева: ${left}`);
  assert.ok(right >= 1030, `захват машины обрезан справа: ${right}`);
});

test('после аварийной сцены камера снова следует за игроком', () => {
  const player = { x: 1120, y: 580 };
  const target = getSceneCameraTarget({
    scene: 'red-crate',
    player,
    arm: { failure: { phase: 'freeze', progress: 1 } },
    warehouse: { crates: [{ id: 'red-01', x: 720, y: 575, status: 'blocked' }] },
  });

  assert.equal(target, player);
});
