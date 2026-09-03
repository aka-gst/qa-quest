export const GAME_VERSION = 1;
export const STORAGE_KEY = 'quequest.game.v1';

export const WORLD = Object.freeze({ width: 1600, height: 900 });
export const THREATS_TO_COLLAPSE = 6;
export const MANUAL_CRATES_REQUIRED = 3;
export const COLLAPSE_DURATION = 2.5;
export const MAX_DT = 0.05;

export const CHECKPOINTS = Object.freeze([
  'start',
  'warehouse',
  'machine',
  'red-crate',
  'reward',
]);
