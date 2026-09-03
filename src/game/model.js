import {
  COLLAPSE_DURATION,
  MANUAL_CRATES_REQUIRED,
  MAX_DT,
  THREATS_TO_COLLAPSE,
} from './config.js';

const DEFAULT_STATE = Object.freeze({
  scene: 'prologue',
  sceneTime: 0,
  elapsed: 0,
  checkpoint: 'start',
  powers: Object.freeze({ dash: true, pulse: true, shield: true }),
  player: Object.freeze({
    x: 400,
    y: 450,
    carrying: null,
    energy: 3,
    shieldUntil: 0,
  }),
  prologue: Object.freeze({ threats: 0, waveRadius: 0 }),
  warehouse: Object.freeze({
    manualDelivered: 0,
    autoDelivered: 0,
    wage: 0,
    freeTime: 0,
  }),
  arm: Object.freeze({ awake: false, blocked: false, queue: [], active: null }),
});

function mergePart(base, override) {
  return { ...base, ...(override ?? {}) };
}

export function createGameState(overrides = {}) {
  return {
    ...DEFAULT_STATE,
    ...overrides,
    powers: mergePart(DEFAULT_STATE.powers, overrides.powers),
    player: mergePart(DEFAULT_STATE.player, overrides.player),
    prologue: mergePart(DEFAULT_STATE.prologue, overrides.prologue),
    warehouse: mergePart(DEFAULT_STATE.warehouse, overrides.warehouse),
    arm: {
      ...mergePart(DEFAULT_STATE.arm, overrides.arm),
      queue: [...(overrides.arm?.queue ?? DEFAULT_STATE.arm.queue)],
    },
  };
}

function enterCollapse(state) {
  return { ...state, scene: 'collapse', sceneTime: 0 };
}

export function applyGameAction(state, action) {
  switch (action?.type) {
    case 'threat-neutralized': {
      if (state.scene !== 'prologue') return state;
      const threats = Math.min(
        THREATS_TO_COLLAPSE,
        state.prologue.threats + 1,
      );
      const next = {
        ...state,
        prologue: { ...state.prologue, threats },
      };
      return threats === THREATS_TO_COLLAPSE ? enterCollapse(next) : next;
    }
    case 'manual-crate-delivered': {
      if (state.scene !== 'warehouse') return state;
      const manualDelivered = Math.min(
        MANUAL_CRATES_REQUIRED,
        state.warehouse.manualDelivered + 1,
      );
      return {
        ...state,
        scene: manualDelivered === MANUAL_CRATES_REQUIRED ? 'machine' : state.scene,
        checkpoint: manualDelivered === MANUAL_CRATES_REQUIRED ? 'machine' : state.checkpoint,
        warehouse: { ...state.warehouse, manualDelivered },
      };
    }
    case 'dash': {
      if (!state.powers.dash) return state;
      const length = Math.hypot(action.x ?? 0, action.y ?? 0) || 1;
      return {
        ...state,
        player: {
          ...state.player,
          x: state.player.x + ((action.x ?? 0) / length) * 140,
          y: state.player.y + ((action.y ?? 0) / length) * 140,
        },
      };
    }
    case 'pulse':
      if (!state.powers.pulse) return state;
      return {
        ...state,
        prologue: { ...state.prologue, waveRadius: 180 },
      };
    case 'shield':
      if (!state.powers.shield) return state;
      return {
        ...state,
        player: { ...state.player, shieldUntil: state.elapsed + 2 },
      };
    default:
      return state;
  }
}

export function stepGame(state, _input, rawDt) {
  const dt = Math.min(MAX_DT, Math.max(0, Number.isFinite(rawDt) ? rawDt : 0));
  const next = {
    ...state,
    elapsed: state.elapsed + dt,
    sceneTime: state.sceneTime + dt,
  };

  if (next.scene === 'collapse' && next.sceneTime >= COLLAPSE_DURATION) {
    return {
      ...next,
      scene: 'warehouse',
      sceneTime: 0,
      checkpoint: 'warehouse',
      powers: { dash: false, pulse: false, shield: false },
    };
  }

  return next;
}
