import { CHECKPOINTS, GAME_VERSION, STORAGE_KEY } from './config.js';

const FALLBACK = Object.freeze({ checkpoint: 'start' });

export function loadCheckpoint(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(STORAGE_KEY));
    if (
      parsed?.version === GAME_VERSION
      && CHECKPOINTS.includes(parsed.checkpoint)
    ) {
      return { checkpoint: parsed.checkpoint };
    }
  } catch {
    // A broken save must never stop a new run.
  }
  return { ...FALLBACK };
}

export function saveCheckpoint(storage = globalThis.localStorage, state) {
  const checkpoint = CHECKPOINTS.includes(state?.checkpoint)
    ? state.checkpoint
    : FALLBACK.checkpoint;
  storage?.setItem(STORAGE_KEY, JSON.stringify({
    version: GAME_VERSION,
    checkpoint,
  }));
}

export function resetCheckpoint(storage = globalThis.localStorage) {
  storage?.removeItem(STORAGE_KEY);
}
