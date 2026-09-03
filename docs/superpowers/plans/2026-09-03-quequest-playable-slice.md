# QueQuest Playable Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a game-first 5–8 minute QueQuest slice with immediate god-mode play, a collapse, manual warehouse work, and a robotic arm driven by the player’s real Python.

**Architecture:** Replace the old course entry with a new standalone game import graph. Keep simulation state and Python event validation pure and testable; DOM/canvas renderers consume that state, while the existing isolated Pyodide worker is reused only as an execution engine and extended to return allowlisted declarative events.

**Tech Stack:** Static HTML/CSS, browser ES modules, Canvas 2D, Web Audio synthesis, Web Worker, Pyodide/CPython, Node’s built-in test runner, Playwright for browser acceptance.

**Spec:** `docs/superpowers/specs/2026-09-03-quequest-game-first-reset-design.md`

## Global Constraints

- The product starts from `quequest.game.v1`; it never reads `qaquest.v2`.
- First controllable action is available within 10 seconds and before more than two short text lines.
- Python cannot access DOM or execute JavaScript; the main thread accepts only allowlisted world events.
- A Python event produces exactly one corresponding world action; no canned success animation.
- The first slice ends at the red crate and one-table Q-Bot reward panorama.
- Store, real LLM, agent team, ANIGMA economy, Tulpa, story archive, Unity, server changes, deployment, and site mirror changes are outside this plan.
- Source repository is `/Users/gst/dev/QA Quest`; `/Users/gst/dev/aka-gst.ru/qa-quest` is untouched.
- No new external packages are installed.
- Controls support keyboard, pointer, and 44px minimum touch targets at 390×844.
- Reduced-motion mode keeps all state changes readable without camera shake or flashes.

## File Map

- Create `src/game/config.js`: fixed world sizes, scene identifiers, tuning values, copy, and storage key.
- Create `src/game/model.js`: pure game state and transition/update functions.
- Create `src/game/events.js`: validate and normalize Python world events.
- Create `src/game/save.js`: checkpoint-only persistence under `quequest.game.v1`.
- Create `src/game/input.js`: keyboard/pointer/touch action state.
- Create `src/game/audio.js`: small procedural Web Audio cues with mute support.
- Create `src/game/render.js`: deterministic Canvas 2D renderer for prologue, collapse, warehouse, and reward.
- Create `src/game/machine.js`: arm-panel controller and Python task definitions.
- Create `src/game/main.js`: runtime loop and orchestration.
- Modify `src/runner.js`: accept an event variable and preserve returned events.
- Modify `src/pyworker.js`: serialize a bounded event list from the Python namespace.
- Replace `index.html`: accessible game shell, canvas, HUD, controls, machine panel, and ending panel.
- Replace `styles.css`: responsive game layout and visual direction.
- Create `tools/game-model.test.mjs`: state and transition tests.
- Create `tools/game-events.test.mjs`: event allowlist and negative controls.
- Create `tools/game-save.test.mjs`: checkpoint isolation tests.
- Create `tools/game-shell.test.mjs`: static shell/import/privacy checks.
- Create `src/game/telemetry.js`: local-only acceptance timings with no production writes.

---

### Task 1: Pure game state and clean persistence

**Files:**
- Create: `src/game/config.js`
- Create: `src/game/model.js`
- Create: `src/game/save.js`
- Test: `tools/game-model.test.mjs`
- Test: `tools/game-save.test.mjs`

**Interfaces:**
- Produces: `createGameState(checkpoint?) -> GameState`
- Produces: `stepGame(state, input, dt) -> GameState`
- Produces: `applyGameAction(state, action) -> GameState`
- Produces: `loadCheckpoint(storage)`, `saveCheckpoint(storage, state)`, `resetCheckpoint(storage)`
- `GameState.scene` is one of `prologue`, `collapse`, `warehouse`, `machine`, `automation`, `red-crate`, `reward`.

- [ ] **Step 1: Write failing model tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createGameState, applyGameAction } from '../src/game/model.js';

test('six neutralized threats trigger collapse', () => {
  let state = createGameState();
  for (let i = 0; i < 6; i += 1) state = applyGameAction(state, { type: 'threat-neutralized' });
  assert.equal(state.scene, 'collapse');
});

test('three manual crates unlock the machine without completing automation', () => {
  let state = createGameState({ scene: 'warehouse' });
  for (let i = 0; i < 3; i += 1) state = applyGameAction(state, { type: 'manual-crate-delivered' });
  assert.equal(state.scene, 'machine');
  assert.equal(state.arm.awake, false);
});
```

- [ ] **Step 2: Run model tests and observe missing modules**

Run: `node --test tools/game-model.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/game/model.js`.

- [ ] **Step 3: Implement fixed configuration and pure transitions**

`config.js` defines `STORAGE_KEY = 'quequest.game.v1'`, `THREATS_TO_COLLAPSE = 6`, `MANUAL_CRATES_REQUIRED = 3`, world dimensions `1600×900`, identical crate route coordinates, and scene copy. `model.js` returns new objects rather than mutating input and clamps `dt` to 50ms.

```js
export function applyGameAction(state, action) {
  if (action.type === 'threat-neutralized') {
    const threats = Math.min(THREATS_TO_COLLAPSE, state.prologue.threats + 1);
    return { ...state, scene: threats === THREATS_TO_COLLAPSE ? 'collapse' : state.scene,
      prologue: { ...state.prologue, threats } };
  }
  if (action.type === 'manual-crate-delivered') {
    const delivered = Math.min(MANUAL_CRATES_REQUIRED, state.warehouse.manualDelivered + 1);
    return { ...state, scene: delivered === MANUAL_CRATES_REQUIRED ? 'machine' : state.scene,
      warehouse: { ...state.warehouse, manualDelivered: delivered } };
  }
  return state;
}
```

- [ ] **Step 4: Write and run persistence isolation tests**

```js
test('reset removes only the new game key', () => {
  const storage = fakeStorage({ 'qaquest.v2': 'old', 'quequest.game.v1': '{"scene":"warehouse"}' });
  resetCheckpoint(storage);
  assert.equal(storage.getItem('qaquest.v2'), 'old');
  assert.equal(storage.getItem('quequest.game.v1'), null);
});
```

Run: `node --test tools/game-model.test.mjs tools/game-save.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit state foundation**

```bash
git add src/game/config.js src/game/model.js src/game/save.js tools/game-model.test.mjs tools/game-save.test.mjs
git commit -m "Создать состояние новой игры QueQuest"
```

### Task 2: New standalone game shell

**Files:**
- Replace: `index.html`
- Replace: `styles.css`
- Create: `src/game/main.js`
- Test: `tools/game-shell.test.mjs`

**Interfaces:**
- Consumes: `createGameState`, checkpoint functions.
- Produces DOM IDs: `gameCanvas`, `gameHud`, `missionText`, `actionButton`, `powerDash`, `powerPulse`, `powerShield`, `machinePanel`, `codeInput`, `runCode`, `gameMessage`, `soundToggle`, `restartGame`.

- [ ] **Step 1: Write a failing shell test**

```js
test('page boots only the new game runtime', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /src\/game\/main\.js/);
  assert.doesNotMatch(html, /src\/main\.js/);
  assert.doesNotMatch(html, /qaquest\.v2|lessonScreen|mapScreen/);
  for (const id of ['gameCanvas', 'machinePanel', 'actionButton', 'runCode']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
});
```

- [ ] **Step 2: Run the shell test and verify failure**

Run: `node --test tools/game-shell.test.mjs`

Expected: FAIL because the old course shell imports `src/main.js`.

- [ ] **Step 3: Build the new accessible shell and layout**

The page contains one full-viewport stage with layered HUD. Power buttons are inside the stage; the machine panel slides over at most 42% of desktop width and becomes a bottom sheet on mobile. The first screen contains the promise `Ты всё умел. Теперь вспомни.` and one prompt `Двигайся`.

```html
<main id="game" class="game" data-scene="prologue">
  <canvas id="gameCanvas" width="1600" height="900" aria-label="Игровой мир QueQuest"></canvas>
  <section id="gameHud" class="hud" aria-live="polite">
    <p id="missionText">Верни контроль</p>
    <p id="gameMessage"></p>
  </section>
  <button id="actionButton" class="touch-action" type="button">ДЕЙСТВИЕ</button>
</main>
<script type="module" src="src/game/main.js"></script>
```

- [ ] **Step 4: Implement a boot loop that renders a visible placeholder world**

`main.js` loads the new checkpoint, sets `data-scene`, and starts `requestAnimationFrame`; it must not import old `src/main.js`, `src/store.js`, or content modules.

- [ ] **Step 5: Run shell and existing Python worker diagnostics**

Run: `node --test tools/game-shell.test.mjs tools/python-unavailable.test.mjs`

Expected: new shell PASS; runner diagnostic PASS.

- [ ] **Step 6: Commit the new entry point**

```bash
git add index.html styles.css src/game/main.js tools/game-shell.test.mjs
git commit -m "Заменить курс игровым экраном QueQuest"
```

### Task 3: Playable god-mode prologue and collapse

**Files:**
- Create: `src/game/input.js`
- Create: `src/game/render.js`
- Modify: `src/game/model.js`
- Modify: `src/game/main.js`
- Modify: `styles.css`
- Test: `tools/game-model.test.mjs`

**Interfaces:**
- Produces: `createInput(target) -> { state, destroy() }` with normalized `moveX`, `moveY`, `dash`, `pulse`, `shield`, `action`.
- Produces: `renderGame(ctx, state, viewport, now)`.
- Model actions: `dash`, `pulse`, `shield`, `threat-neutralized`, `collapse-finished`.

- [ ] **Step 1: Add failing tests for distinct powers and timed collapse**

```js
test('each prologue power has a different consequence', () => {
  const base = createGameState();
  assert.equal(applyGameAction(base, { type: 'dash' }).player.energy, base.player.energy - 1);
  assert.ok(applyGameAction(base, { type: 'pulse' }).prologue.waveRadius > 0);
  assert.ok(applyGameAction(base, { type: 'shield' }).player.shieldUntil > 0);
});

test('collapse ends at warehouse with all powers unavailable', () => {
  const collapsed = createGameState({ scene: 'collapse', sceneTime: 2300 });
  const next = stepGame(collapsed, {}, 250);
  assert.equal(next.scene, 'warehouse');
  assert.deepEqual(next.powers, { dash: false, pulse: false, shield: false });
});
```

- [ ] **Step 2: Verify the new tests fail, then implement power mechanics**

Run: `node --test tools/game-model.test.mjs`

Expected before implementation: FAIL on missing power consequences.

Prologue uses movement, six threats with deterministic starting positions, short cooldowns, hit flash, particles, and camera impulse. Threats move toward the hero; the player can neutralize them using all three powers. A 30-second timeout also enters collapse so the scene cannot stall.

- [ ] **Step 3: Render the prologue as an active world**

Use Canvas layers: industrial floor, animated grid, skyline from `art/night2-hero.jpg` as a low-opacity background crop, player silhouette, threats, particles, and HUD charge arcs. Reduced motion disables camera impulse but not hit state.

- [ ] **Step 4: Add keyboard and touch controls**

Keyboard: WASD/arrows move, Shift dash, Q pulse, E shield, Space action. Pointer/touch: stage drag supplies movement; three explicit 52px power buttons and one action button trigger abilities.

- [ ] **Step 5: Run tests and a 30-second local smoke page**

Run: `node --test tools/game-model.test.mjs tools/game-shell.test.mjs`

Expected: PASS; no console errors after moving and using all three powers.

- [ ] **Step 6: Commit the playable prologue**

```bash
git add src/game/input.js src/game/render.js src/game/model.js src/game/main.js styles.css tools/game-model.test.mjs
git commit -m "Добавить боевой пролог и потерю сил"
```

### Task 4: Warehouse manual labor loop

**Files:**
- Modify: `src/game/config.js`
- Modify: `src/game/model.js`
- Modify: `src/game/render.js`
- Modify: `src/game/main.js`
- Test: `tools/game-model.test.mjs`

**Interfaces:**
- Crate state: `{ id, kind: 'normal'|'red', x, y, status: 'source'|'carried'|'pallet'|'blocked' }`.
- Model actions: `pick-crate`, `drop-crate`, `manual-crate-delivered`.
- Produces derived prompt `getNearbyAction(state) -> null | { type, label }`.

- [ ] **Step 1: Add failing pickup, drop, and distance tests**

```js
test('action picks only a nearby ordinary crate', () => {
  const state = createGameState({ scene: 'warehouse' });
  const far = applyGameAction(state, { type: 'pick-crate', crateId: 'box-01', distance: 200 });
  assert.equal(far.player.carrying, null);
  const near = applyGameAction(state, { type: 'pick-crate', crateId: 'box-01', distance: 30 });
  assert.equal(near.player.carrying, 'box-01');
});
```

- [ ] **Step 2: Run the test, implement deterministic crate interaction, rerun**

Run: `node --test tools/game-model.test.mjs`

Expected before: FAIL; after: PASS.

- [ ] **Step 3: Render the warehouse as a traversable scene**

Use `garage-bg.jpg` as atmospheric background, then render collision-safe floor zones, source belt, target pallet, broken arm, three manual crates, six queued automation crates, clock, wage counter, and exploration props. Picking a crate visibly anchors it to the player; dropping outside the pallet leaves it on the floor.

- [ ] **Step 4: Make the arm teach by existing in the world**

During each manual trip the arm head turns 8 degrees toward the carried crate and its status lamp flickers once. No tooltip names automation. After the third delivery the lamp stays amber and the machine panel affordance pulses.

- [ ] **Step 5: Verify one complete manual route on desktop and mobile dimensions**

Run the local server and use keyboard plus pointer emulation. Record time for three equal-distance transfers; confirm the player cannot deliver from across the room.

- [ ] **Step 6: Commit the warehouse loop**

```bash
git add src/game/config.js src/game/model.js src/game/render.js src/game/main.js tools/game-model.test.mjs
git commit -m "Сделать ручную работу на складе игровой"
```

### Task 5: Safe Python-to-world event bridge

**Files:**
- Create: `src/game/events.js`
- Modify: `src/runner.js`
- Modify: `src/pyworker.js`
- Test: `tools/game-events.test.mjs`

**Interfaces:**
- Produces: `validateWorldEvents(raw, scene) -> { ok, events, error }`.
- `runPython` accepts `eventVar = '__quest_events__'` and returns `events`.
- Allowed event shape: `{ type: 'arm.move', boxId: allowedBoxId, targetId: 'pallet-a' }`.

- [ ] **Step 1: Write event validator failures first**

```js
test('accepts current-scene IDs and preserves order', () => {
  const result = validateWorldEvents([
    { type: 'arm.move', boxId: 'box-04', targetId: 'pallet-a' },
    { type: 'arm.move', boxId: 'box-05', targetId: 'pallet-a' },
  ], automationScene(['box-04', 'box-05']));
  assert.equal(result.ok, true);
  assert.deepEqual(result.events.map((event) => event.boxId), ['box-04', 'box-05']);
});

for (const raw of [
  [{ type: 'window.eval', value: 'x' }],
  [{ type: 'arm.move', boxId: 'unknown', targetId: 'pallet-a' }],
  [{ type: 'arm.move', boxId: 'box-04', targetId: 'pallet-a', extra: true }],
]) test(`rejects ${JSON.stringify(raw)}`, () => assert.equal(validateWorldEvents(raw, automationScene(['box-04'])).ok, false));
```

- [ ] **Step 2: Run and observe missing validator**

Run: `node --test tools/game-events.test.mjs`

Expected: FAIL with missing export.

- [ ] **Step 3: Implement strict structural validation**

Reject non-arrays, more events than remaining boxes, duplicate box IDs, unknown keys, non-string IDs, IDs outside the current scene, wrong target, and unknown type. Return a fresh normalized array; never pass raw objects into the renderer.

- [ ] **Step 4: Extend the Python harness with bounded serialization**

Inside `_quest_run`, fetch `event_var` from the request, copy only JSON-serializable list content, limit it to 32 entries, and include `events` even when empty. If event serialization fails, return a `WorldEventError` without crashing the worker.

```python
raw_events = ns.get(event_var, []) if event_var else []
if not isinstance(raw_events, list) or len(raw_events) > 32:
    raise ValueError('invalid world event list')
events = json.loads(json.dumps(raw_events))
```

- [ ] **Step 5: Run positive and red-control tests**

Run: `node --test tools/game-events.test.mjs tools/python-unavailable.test.mjs`

Then temporarily allow an unknown `type` in a local unstaged edit and verify the negative test fails; restore that one line with `apply_patch` and rerun.

Expected: all tests PASS after restoration.

- [ ] **Step 6: Commit the event bridge**

```bash
git add src/game/events.js src/runner.js src/pyworker.js tools/game-events.test.mjs
git commit -m "Связать настоящий Python с событиями мира"
```

### Task 6: Machine panel and physical automation

**Files:**
- Create: `src/game/machine.js`
- Modify: `src/game/model.js`
- Modify: `src/game/render.js`
- Modify: `src/game/main.js`
- Modify: `styles.css`
- Test: `tools/game-model.test.mjs`
- Test: `tools/game-events.test.mjs`

**Interfaces:**
- Produces: `runWake(source) -> Promise<MachineResult>`.
- Produces: `runAutomation(source, boxIds) -> Promise<MachineResult>`.
- `MachineResult = { ok, stdout, error, events, ms }`.
- Model actions: `arm-awake`, `automation-queued`, `arm-transfer-finished`, `automation-rejected`.

- [ ] **Step 1: Add failing tests for two-stage activation**

```js
test('wake does not move crates', () => {
  const state = applyGameAction(createGameState({ scene: 'machine' }), { type: 'arm-awake' });
  assert.equal(state.arm.awake, true);
  assert.equal(state.warehouse.autoDelivered, 0);
});

test('one accepted event moves exactly one crate after transfer completion', () => {
  let state = applyGameAction(createGameState({ scene: 'automation' }), {
    type: 'automation-queued', events: [{ type: 'arm.move', boxId: 'box-04', targetId: 'pallet-a' }],
  });
  assert.equal(state.warehouse.autoDelivered, 0);
  state = applyGameAction(state, { type: 'arm-transfer-finished', boxId: 'box-04' });
  assert.equal(state.warehouse.autoDelivered, 1);
});
```

- [ ] **Step 2: Implement the machine preambles**

Wake preamble has no world events. Automation preamble defines immutable `Box` records, `boxes`, `pallet = 'pallet-a'`, and `Arm.move` that appends exactly `{type, boxId, targetId}` to `__quest_events__`.

- [ ] **Step 3: Build the embedded machine panel**

Stage one shows `print("WAKE")`. Successful output lights the arm and swaps to:

```python
for box in boxes:
    arm.move(box, ___)
```

The visible world labels the destination `pallet`. `Run` is disabled while Python is running; errors show type, line, and existing hint. The panel never awards progress on error or rejected events.

- [ ] **Step 4: Animate each accepted event as one transfer**

The arm queue advances only after the previous crate reaches the pallet. Each animation has pickup, swing, release, counter increment, wage increment, and a short sound. The player can move while the queue runs. The first movement timestamp is logged locally.

- [ ] **Step 5: Verify behavior-changing code**

Run once with all `boxes`, once with `boxes[:2]`, and once with `unknown`. Confirm visible transfers are respectively all, two, and zero; only the full valid result advances the scene.

- [ ] **Step 6: Commit the machine loop**

```bash
git add src/game/machine.js src/game/model.js src/game/render.js src/game/main.js styles.css tools/game-model.test.mjs tools/game-events.test.mjs
git commit -m "Оживить складскую руку настоящим Python"
```

### Task 7: Red crate hook, reward, sound, and checkpoints

**Files:**
- Create: `src/game/audio.js`
- Modify: `src/game/config.js`
- Modify: `src/game/model.js`
- Modify: `src/game/render.js`
- Modify: `src/game/main.js`
- Modify: `styles.css`
- Modify: `tools/game-model.test.mjs`
- Modify: `tools/game-save.test.mjs`

**Interfaces:**
- Produces: `createAudioBus() -> { unlock, setMuted, play(name) }`.
- Sound names: `hit`, `dash`, `collapse`, `pickup`, `drop`, `wake`, `arm`, `blocked`, `reward`.
- Checkpoints: `start`, `warehouse`, `machine`, `red-crate`, `reward`.

- [ ] **Step 1: Add failing red-crate and checkpoint tests**

```js
test('red crate blocks the ordinary automation route', () => {
  const state = createGameState({ scene: 'automation', warehouse: { autoDelivered: 6 } });
  const next = applyGameAction(state, { type: 'arm-hit-red-crate' });
  assert.equal(next.scene, 'red-crate');
  assert.equal(next.arm.blocked, true);
});

test('checkpoint serializes scene boundaries, not flying crate positions', () => {
  saveCheckpoint(storage, stateWithFlyingCrate);
  const saved = JSON.parse(storage.getItem('quequest.game.v1'));
  assert.equal(saved.checkpoint, 'machine');
  assert.equal('crates' in saved, false);
});
```

- [ ] **Step 2: Implement the red-crate interruption and reward panorama**

After six ordinary transfers, the red crate arrives. The arm grips, flashes warning, releases safely, and locks with the line `ЭТОТ ЯЩИК НЕЛЬЗЯ НЕСТИ ТУДА ЖЕ`. After inspection, show the one-table home panorama with `art/garage-milestone-1.jpg` or `garage-panel.jpg`, the old computer, empty Q-Bot shell, earned wage, and button `ПРОДОЛЖЕНИЕ СКОРО`.

- [ ] **Step 3: Add procedural sound without external assets**

Use short oscillators/noise through a master gain. Audio unlocks only after the first real input, respects mute, and never starts from an automated browser load. `prefers-reduced-motion` does not mute audio; mute is independent.

- [ ] **Step 4: Save only safe scene checkpoints**

Save on collapse completion, third manual crate, arm wake, red crate, and reward. Reload reconstructs deterministic scene objects from config. `restartGame` confirms once after progress begins and removes only `quequest.game.v1`.

- [ ] **Step 5: Run state, save, and shell tests**

Run: `node --test tools/game-model.test.mjs tools/game-save.test.mjs tools/game-shell.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit the completed slice**

```bash
git add src/game/audio.js src/game/config.js src/game/model.js src/game/render.js src/game/main.js styles.css tools/game-model.test.mjs tools/game-save.test.mjs
git commit -m "Завершить первый игровой срез QueQuest"
```

### Task 8: Local telemetry and human-facing browser acceptance

**Files:**
- Modify: `src/game/main.js`
- Create: `src/game/telemetry.js`
- Modify: `README.md`

**Interfaces:**
- Local event record: `{ name, at, value? }` in memory and optionally `window.__QUEQUEST_DEBUG__.events` on localhost only.
- Browser debug surface: `window.__QUEQUEST_DEBUG__.snapshot()` and `.dispatch(action)` only on localhost.

- [ ] **Step 1: Start browser acceptance from a clean origin**

Use the existing Playwright control skill against the local HTTP server, clear local storage, reload, and inspect two facts: `#game[data-scene="prologue"]` exists and the document contains neither `КАРТА КУРСА` nor `lessonScreen`. Do not install or add a Playwright package to the repository.

- [ ] **Step 2: Add local metrics without production writes**

Record first action ms, controlled-world time, manual transfer durations, Python cold load, ready Run-to-motion, event-accept-to-motion, automated transfer durations, and slice completion. Do not send code, stdout, error text, identifiers, or test traffic to Umami.

- [ ] **Step 3: Run complete positive browser path at 1440×900**

Start a local HTTP server, finish six threats, three manual boxes, WAKE, fill `pallet`, watch all automatic transfers, inspect the red crate, and reach reward. Assert every scene transition and visible consequence.

- [ ] **Step 4: Run mobile path at 390×844 and landscape**

Use pointer/touch emulation. Assert all action controls are at least 44×44 CSS pixels, canvas remains visible while the machine panel is open, no horizontal overflow exists, and the first screen fits without scrolling.

- [ ] **Step 5: Run meaningful negative controls**

Run invalid Python, unavailable Pyodide, unknown world event, duplicate box event, reload during arm transfer, and restart cancel/confirm. Break one validator allowlist condition and confirm the test turns red before restoring it.

- [ ] **Step 6: Measure the actual environment before timing claims**

Measure `requestAnimationFrame` FPS for one second and record system load. Report timing only if the browser stays above 45 FPS. For automation speed, compare median of at least three manual and three automatic transfers on the identical route.

- [ ] **Step 7: Run the full local test set**

Run:

```bash
node --test tools/game-model.test.mjs tools/game-events.test.mjs tools/game-save.test.mjs tools/game-shell.test.mjs
python3 tools/verify_content.py
sh tools/selftest.sh
```

Expected: new game tests PASS. Old content diagnostics may be reported separately but cannot block the new product unless the reused runner fails.

- [ ] **Step 8: Update README with one-line local launch and controls**

Document `python3 -m http.server 8765`, `http://127.0.0.1:8765/`, keyboard/touch controls, new storage key, and the explicit statement that this commit is local source—not a live deployment.

- [ ] **Step 9: Commit acceptance instrumentation**

```bash
git add src/game/main.js src/game/telemetry.js README.md
git commit -m "Проверить QueQuest как игру в браузере"
```

### Task 9: Independent acceptance and source handoff

**Files:**
- Modify only files implicated by observed failures.
- Update: `docs/superpowers/plans/2026-09-03-quequest-playable-slice.md` checkboxes.

**Interfaces:**
- Acceptance output separates observed behavior, code inspection, and unverified live/deployment state.

- [ ] **Step 1: Request independent read-only review**

Give the reviewer the spec, commit range, local address, clean-profile requirement, positive path, negative control, and both mobile viewports. The author does not accept their own work.

- [ ] **Step 2: Fix only reproduced blockers**

For each failure, record observed state, expected state, reproduction steps, and changed file. Re-run the single red test before the full targeted set.

- [ ] **Step 3: Capture one deterministic 10-second before/after loop**

Record the same warehouse framing: first five seconds show manual transfer and stalled arm; next five show the player stepping away while the arm rapidly clears the line. The clip must contain continuous world movement, not a slideshow, and must not show private paths or debug data.

- [ ] **Step 4: Stop and add a concrete correction task if acceptance finds a blocker**

Do not make an unspecified catch-all commit. Record the exact failing path and add one correction task naming its files, red test, implementation, green test, and explicit commit before changing source.

- [ ] **Step 5: Push source after clean independent acceptance**

Push the current branch and verify local HEAD equals `refs/heads/main`. Do not deploy or edit the site mirror in this task.
