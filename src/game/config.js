export const GAME_VERSION = 1;
export const STORAGE_KEY = 'quequest.game.v1';

export const WORLD = Object.freeze({ width: 1600, height: 900 });
export const THREATS_TO_COLLAPSE = 6;
export const MANUAL_CRATES_REQUIRED = 3;
export const COLLAPSE_DURATION = 2.5;
export const MAX_DT = 0.05;
export const PLAYER_SPEED = 310;
export const INTERACTION_RADIUS = 92;
export const PROLOGUE_TIMEOUT = 30;

export const PALLET = Object.freeze({ id: 'pallet-a', x: 1300, y: 590, width: 180, height: 120 });
export const MACHINE = Object.freeze({ x: 1010, y: 350 });

export const THREAT_LAYOUT = Object.freeze([
  { id: 'threat-01', x: 1030, y: 450 },
  { id: 'threat-02', x: 965, y: 655 },
  { id: 'threat-03', x: 735, y: 690 },
  { id: 'threat-04', x: 545, y: 535 },
  { id: 'threat-05', x: 640, y: 310 },
  { id: 'threat-06', x: 900, y: 270 },
]);

export const CRATE_LAYOUT = Object.freeze([
  { id: 'box-01', kind: 'normal', x: 265, y: 560, status: 'source' },
  { id: 'box-02', kind: 'normal', x: 205, y: 630, status: 'source' },
  { id: 'box-03', kind: 'normal', x: 325, y: 650, status: 'source' },
  { id: 'box-04', kind: 'normal', x: 155, y: 515, status: 'queued' },
  { id: 'box-05', kind: 'normal', x: 110, y: 585, status: 'queued' },
  { id: 'box-06', kind: 'normal', x: 160, y: 655, status: 'queued' },
  { id: 'box-07', kind: 'normal', x: 80, y: 515, status: 'queued' },
  { id: 'box-08', kind: 'normal', x: 55, y: 585, status: 'queued' },
  { id: 'box-09', kind: 'normal', x: 80, y: 655, status: 'queued' },
  { id: 'red-01', kind: 'red', x: 25, y: 585, status: 'hidden' },
]);

export const CHECKPOINTS = Object.freeze([
  'start',
  'warehouse',
  'machine',
  'red-crate',
  'reward',
]);
