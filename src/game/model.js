import {
  COLLAPSE_DURATION,
  CRATE_LAYOUT,
  INTERACTION_RADIUS,
  MANUAL_CRATES_REQUIRED,
  MAX_DT,
  PALLET,
  PLAYER_SPEED,
  PROLOGUE_TIMEOUT,
  THREAT_LAYOUT,
  THREATS_TO_COLLAPSE,
  WORLD,
} from './config.js';

const DEFAULT_STATE = Object.freeze({
  scene: 'prologue',
  sceneTime: 0,
  elapsed: 0,
  checkpoint: 'start',
  powers: Object.freeze({ dash: true, pulse: true, shield: true }),
  player: Object.freeze({
    x: 800,
    y: 480,
    facingX: 1,
    facingY: 0,
    carrying: null,
    energy: 3,
    shieldUntil: 0,
  }),
  prologue: Object.freeze({ threats: 0, waveRadius: 0, enemies: [] }),
  warehouse: Object.freeze({
    manualDelivered: 0,
    autoDelivered: 0,
    wage: 0,
    freeTime: 0,
    crates: [],
  }),
  arm: Object.freeze({ awake: false, blocked: false, queue: [], active: null }),
});

function cloneEnemies(enemies = THREAT_LAYOUT) {
  return enemies.map((enemy) => ({ ...enemy, alive: enemy.alive ?? true }));
}

function cloneCrates(crates = CRATE_LAYOUT) {
  return crates.map((crate) => ({ ...crate }));
}

function mergePart(base, override) {
  return { ...base, ...(override ?? {}) };
}

export function createGameState(overrides = {}) {
  const prologue = mergePart(DEFAULT_STATE.prologue, overrides.prologue);
  const warehouse = mergePart(DEFAULT_STATE.warehouse, overrides.warehouse);
  return {
    ...DEFAULT_STATE,
    ...overrides,
    powers: mergePart(DEFAULT_STATE.powers, overrides.powers),
    player: mergePart(DEFAULT_STATE.player, overrides.player),
    prologue: {
      ...prologue,
      enemies: cloneEnemies(overrides.prologue?.enemies ?? THREAT_LAYOUT),
    },
    warehouse: {
      ...warehouse,
      crates: cloneCrates(overrides.warehouse?.crates ?? CRATE_LAYOUT),
    },
    arm: {
      ...mergePart(DEFAULT_STATE.arm, overrides.arm),
      queue: [...(overrides.arm?.queue ?? DEFAULT_STATE.arm.queue)],
      active: overrides.arm?.active ? { ...overrides.arm.active } : null,
    },
  };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function withNeutralized(state, ids) {
  const idSet = new Set(ids);
  const enemies = state.prologue.enemies.map((enemy) => (
    idSet.has(enemy.id) ? { ...enemy, alive: false } : enemy
  ));
  const threats = enemies.filter((enemy) => !enemy.alive).length;
  const next = {
    ...state,
    prologue: { ...state.prologue, enemies, threats },
  };
  return threats >= THREATS_TO_COLLAPSE
    ? { ...next, scene: 'collapse', sceneTime: 0 }
    : next;
}

function nearestAlive(state, maxDistance = Infinity) {
  return state.prologue.enemies
    .filter((enemy) => enemy.alive)
    .map((enemy) => ({ enemy, distance: distance(state.player, enemy) }))
    .filter((entry) => entry.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
}

function enterWarehouse(state) {
  return {
    ...state,
    scene: 'warehouse',
    sceneTime: 0,
    checkpoint: 'warehouse',
    powers: { dash: false, pulse: false, shield: false },
    player: {
      ...state.player,
      x: 520,
      y: 580,
      carrying: null,
      shieldUntil: 0,
    },
  };
}

function updateCrate(state, crateId, updater) {
  return state.warehouse.crates.map((crate) => (
    crate.id === crateId ? updater(crate) : crate
  ));
}

export function applyGameAction(state, action) {
  switch (action?.type) {
    case 'threat-neutralized': {
      if (state.scene !== 'prologue') return state;
      const target = state.prologue.enemies.find((enemy) => enemy.alive);
      return target ? withNeutralized(state, [target.id]) : state;
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
      if (!state.powers.dash || state.scene !== 'prologue') return state;
      const rawX = action.x ?? state.player.facingX ?? 1;
      const rawY = action.y ?? state.player.facingY ?? 0;
      const length = Math.hypot(rawX, rawY) || 1;
      const x = rawX / length;
      const y = rawY / length;
      const moved = {
        ...state,
        player: {
          ...state.player,
          x: Math.max(40, Math.min(WORLD.width - 40, state.player.x + x * 180)),
          y: Math.max(40, Math.min(WORLD.height - 40, state.player.y + y * 180)),
          facingX: x,
          facingY: y,
          energy: Math.max(0, state.player.energy - 1),
        },
      };
      const target = nearestAlive(state, 360).find(({ enemy }) => {
        const dx = enemy.x - state.player.x;
        const dy = enemy.y - state.player.y;
        const projection = dx * x + dy * y;
        const side = Math.abs(dx * y - dy * x);
        return projection > 0 && side < 125;
      });
      return target ? withNeutralized(moved, [target.enemy.id]) : moved;
    }
    case 'pulse': {
      if (!state.powers.pulse || state.scene !== 'prologue') return state;
      const targets = nearestAlive(state, 340).slice(0, 2).map(({ enemy }) => enemy.id);
      const waved = {
        ...state,
        prologue: { ...state.prologue, waveRadius: 210 },
      };
      return targets.length ? withNeutralized(waved, targets) : waved;
    }
    case 'shield':
      if (!state.powers.shield || state.scene !== 'prologue') return state;
      return {
        ...state,
        player: { ...state.player, shieldUntil: state.elapsed + 2 },
      };
    case 'pick-crate': {
      if (state.scene !== 'warehouse' || state.player.carrying || action.distance > INTERACTION_RADIUS) return state;
      const crate = state.warehouse.crates.find(({ id }) => id === action.crateId);
      if (!crate || crate.kind !== 'normal' || !['source', 'floor'].includes(crate.status)) return state;
      return {
        ...state,
        player: { ...state.player, carrying: crate.id },
        warehouse: {
          ...state.warehouse,
          crates: updateCrate(state, crate.id, (item) => ({ ...item, status: 'carried' })),
        },
      };
    }
    case 'drop-crate': {
      if (state.scene !== 'warehouse' || !state.player.carrying) return state;
      const crateId = state.player.carrying;
      const delivered = action.target === PALLET.id;
      const manualDelivered = Math.min(
        MANUAL_CRATES_REQUIRED,
        state.warehouse.manualDelivered + (delivered ? 1 : 0),
      );
      return {
        ...state,
        scene: manualDelivered === MANUAL_CRATES_REQUIRED ? 'machine' : state.scene,
        checkpoint: manualDelivered === MANUAL_CRATES_REQUIRED ? 'machine' : state.checkpoint,
        player: { ...state.player, carrying: null },
        warehouse: {
          ...state.warehouse,
          manualDelivered,
          wage: state.warehouse.wage + (delivered ? 120 : 0),
          crates: updateCrate(state, crateId, (crate) => ({
            ...crate,
            x: delivered ? PALLET.x : (action.x ?? state.player.x),
            y: delivered ? PALLET.y : (action.y ?? state.player.y),
            status: delivered ? 'pallet' : 'floor',
          })),
        },
      };
    }
    default:
      return state;
  }
}

export function getNearbyAction(state) {
  if (state.scene !== 'warehouse') return null;
  if (state.player.carrying) {
    if (distance(state.player, PALLET) <= INTERACTION_RADIUS + 35) {
      return { type: 'drop-crate', target: PALLET.id, label: 'НА ПАЛЕТУ' };
    }
    return { type: 'drop-crate', target: 'floor', label: 'ПОСТАВИТЬ' };
  }

  const nearby = state.warehouse.crates
    .filter((crate) => crate.kind === 'normal' && ['source', 'floor'].includes(crate.status))
    .map((crate) => ({ crate, distance: distance(state.player, crate) }))
    .filter((entry) => entry.distance <= INTERACTION_RADIUS)
    .sort((a, b) => a.distance - b.distance)[0];
  return nearby
    ? { type: 'pick-crate', crateId: nearby.crate.id, label: 'ВЗЯТЬ ЯЩИК' }
    : null;
}

function moveEnemies(state, dt) {
  let reflected = [];
  const enemies = state.prologue.enemies.map((enemy) => {
    if (!enemy.alive) return enemy;
    const dx = state.player.x - enemy.x;
    const dy = state.player.y - enemy.y;
    const length = Math.hypot(dx, dy) || 1;
    const moved = {
      ...enemy,
      x: enemy.x + (dx / length) * 54 * dt,
      y: enemy.y + (dy / length) * 54 * dt,
    };
    if (state.player.shieldUntil > state.elapsed && distance(moved, state.player) < 78) {
      reflected.push(enemy.id);
    }
    return moved;
  });
  const moved = { ...state, prologue: { ...state.prologue, enemies } };
  return reflected.length ? withNeutralized(moved, reflected) : moved;
}

export function stepGame(state, input = {}, rawDt) {
  const dt = Math.min(MAX_DT, Math.max(0, Number.isFinite(rawDt) ? rawDt : 0));
  const moveLength = Math.hypot(input.moveX ?? 0, input.moveY ?? 0) || 1;
  const moveX = (input.moveX ?? 0) / moveLength;
  const moveY = (input.moveY ?? 0) / moveLength;
  const isMoving = Math.abs(input.moveX ?? 0) + Math.abs(input.moveY ?? 0) > 0;
  let next = {
    ...state,
    elapsed: state.elapsed + dt,
    sceneTime: state.sceneTime + dt,
    player: {
      ...state.player,
      x: Math.max(40, Math.min(WORLD.width - 40, state.player.x + moveX * PLAYER_SPEED * dt)),
      y: Math.max(40, Math.min(WORLD.height - 40, state.player.y + moveY * PLAYER_SPEED * dt)),
      facingX: isMoving ? moveX : state.player.facingX,
      facingY: isMoving ? moveY : state.player.facingY,
      energy: Math.min(3, state.player.energy + dt * .25),
    },
    prologue: {
      ...state.prologue,
      waveRadius: Math.max(0, state.prologue.waveRadius - dt * 260),
    },
  };

  if (next.scene === 'prologue') {
    next = moveEnemies(next, dt);
    if (next.sceneTime >= PROLOGUE_TIMEOUT) {
      next = { ...next, scene: 'collapse', sceneTime: 0 };
    }
  }

  if (next.scene === 'collapse' && next.sceneTime >= COLLAPSE_DURATION) {
    return enterWarehouse(next);
  }

  return next;
}
