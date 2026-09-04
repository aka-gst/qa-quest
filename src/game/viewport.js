import { WORLD } from './config.js';

export function getViewportTransform(viewport, player) {
  const portrait = viewport.width < viewport.height * 0.82;
  if (!portrait) {
    const scale = Math.min(viewport.width / WORLD.width, viewport.height / WORLD.height);
    return {
      scale,
      offsetX: (viewport.width - WORLD.width * scale) / 2,
      offsetY: (viewport.height - WORLD.height * scale) / 2,
    };
  }

  const scale = viewport.height / WORLD.height;
  const visibleWidth = viewport.width / scale;
  const cameraX = Math.max(visibleWidth / 2, Math.min(WORLD.width - visibleWidth / 2, player.x));
  return {
    scale,
    offsetX: viewport.width / 2 - cameraX * scale,
    offsetY: 0,
  };
}

export function screenToWorld(point, transform) {
  return {
    x: (point.x - transform.offsetX) / transform.scale,
    y: (point.y - transform.offsetY) / transform.scale,
  };
}
