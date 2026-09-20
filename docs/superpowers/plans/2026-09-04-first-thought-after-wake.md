# First Thought After WAKE Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development while implementing each task. The tasks are tightly coupled inside one runtime, so the QueQuest owner executes them serially and an independent Tester accepts the result.

**Goal:** Turn the existing real `print("WAKE")` success into the visible birth of a local other-mind seed through a strict synthetic event and deterministic fake Gateway.

**Architecture:** Add a pure capability contract and one injected companion runtime. The existing orchestration calls it only after `runWake()` succeeds; model state and Canvas rendering expose the three visual phases without changing the existing arm automation bridge.

**Tech Stack:** Browser ES modules, Canvas 2D, existing Pyodide worker, Node built-in test runner, deterministic in-process async fixture.

**Spec:** `docs/superpowers/specs/2026-09-04-first-thought-after-wake-design.md`

## Global Constraints

- Edit only `/Users/gst/dev/QA Quest/.worktrees/quequest-game` on `codex/quequest-game`.
- Do not modify Tulpa, Local Agent Gateway, main branches, deploy scripts, site mirrors, secrets or user data.
- Production code follows a witnessed RED → GREEN cycle.
- The event and Gateway request contain only fixed allowlisted synthetic values.
- Existing Python `arm.move` behavior remains unchanged.
- No packages are installed.

## File Map

- Create `src/game/other-mind.js`: exact event validation, fixed Tulpa request, deterministic fake Gateway, idempotent runtime and safe snapshot.
- Modify `src/game/model.js`: pure `otherMind` state and guarded phase transitions.
- Modify `src/game/render.js`: draw the seed as distinct sleeping, waking and awake forms.
- Modify `src/game/main.js`: trigger the runtime after successful `runWake`, stream state into the model, and expose safe local counters.
- Modify `index.html`: add an accessible live status line for the other mind.
- Modify `styles.css`: style the status line without obscuring controls on mobile.
- Create `tools/other-mind.test.mjs`: contract, payload, idempotency, streaming and failure controls.
- Modify `tools/game-model.test.mjs`: phase transition tests.
- Modify `tools/game-shell.test.mjs`: accessible status and import checks.

---

### Task 1: Strict capability boundary and fake Gateway

**Files:**
- Create: `src/game/other-mind.js`
- Test: `tools/other-mind.test.mjs`

**Interfaces:**
- Produces: `createMachineListeningEvent() -> CapabilityEvent`
- Produces: `validateCapabilityEvent(raw) -> { ok, event, error }`
- Produces: `createFakeGateway({ fail?, reply?, delay? }) -> { stream(request), snapshot() }`
- Produces: `createOtherMindRuntime({ gateway, onTransition }) -> { unlock(event), snapshot() }`

- [ ] Write tests that name the observable breaks: exact valid event is accepted; an extra `source`, `privateWorkNotes`, `path`, `token`, unknown capability and Cyrillic variant are rejected before the Gateway; the request equals a hand-written literal; two concurrent unlocks make one call; failure yields `silent` without error body.
- [ ] Run `node --test tools/other-mind.test.mjs` and verify RED because `src/game/other-mind.js` is absent.
- [ ] Implement only the exact schema, fixed request and injected deterministic stream needed by the tests.
- [ ] Run the same command and verify all tests GREEN.

### Task 2: Pure game phases

**Files:**
- Modify: `src/game/model.js`
- Modify: `tools/game-model.test.mjs`

**Interfaces:**
- `GameState.otherMind = { phase: 'sleeping'|'waking'|'awake'|'silent', line: string }`
- Actions: `other-mind-waking`, `other-mind-awake`, `other-mind-silent`

- [ ] Add tests proving valid ordered transitions and proving that `awake` cannot be reached directly from `sleeping`.
- [ ] Run `node --test tools/game-model.test.mjs` and verify RED on missing state/transition.
- [ ] Add the minimal immutable state and actions; checkpoint states with an already awake arm restore an awake seed.
- [ ] Rerun the model test and verify GREEN.

### Task 3: Orchestrate the real WAKE and visible birth

**Files:**
- Modify: `src/game/main.js`
- Modify: `src/game/render.js`
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `tools/game-shell.test.mjs`

**Interfaces:**
- `main.js` owns one `createOtherMindRuntime` instance and dispatches its transitions into model state.
- Local `window.__QUEQUEST_DEBUG__.otherMind()` returns the safe runtime snapshot plus visual phase.

- [ ] Extend the shell test to require the accessible `otherMindStatus` and reduced-motion styling; run it and verify RED. Prove the runtime integration through the visible browser transition instead of a static import assertion.
- [ ] Wire successful `runWake()` to exactly one generated event. Keep arm wake independent so a Gateway failure cannot block game progress.
- [ ] Render the seed beside the arm: dark folded shell while sleeping, expanding double ring while waking, iris and tracking arc while awake; render a distinct quiet/error form for `silent`.
- [ ] Update the accessible status with the streamed public line and expose only counters, transitions, phase and line in local debug state.
- [ ] Run `node --test tools/game-shell.test.mjs tools/game-model.test.mjs tools/other-mind.test.mjs` and verify GREEN.

### Task 4: Regression and independent acceptance

**Files:**
- No new production files.
- Test: existing `tools/*.test.mjs` plus independent browser protocol.

- [ ] Run all `node --test tools/*.test.mjs`; record pass/fail count.
- [ ] Prove the new tests can fail by temporarily breaking the exact capability allowlist in an isolated copy or with an injected invalid fixture, then restore and rerun GREEN.
- [ ] Start `python3 -m http.server 4173 --bind 127.0.0.1` and perform the positive browser run from the `machine` checkpoint: exact ASCII `print("WAKE")` produces counters `1/1` and `sleeping→waking→awake`.
- [ ] Perform negative browser runs for `WAKЕ` and `SLEEP`; verify `0/0` and no visual transition.
- [ ] Verify the existing automation source still produces physical `arm.move` events and at least one crate changes to `pallet` only after motion.
- [ ] Hand the SHA and local URL to the independent Tester; the author does not accept their own work.
