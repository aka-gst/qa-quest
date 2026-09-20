# QueQuest 14.0 · Release Pass

## Release thesis

14.0 adds **CITY THREADS**: the world now lives long enough for the player's own past decisions to return later. The game stops being a chain of independent incidents and becomes a ten-shift causal story with recurring people, districts created by successful automation, delayed echoes and a Q-Bot partnership that grows through evidence rather than broad permission.

The progression stays game-first:

**person asks for something understandable → player makes a local promise → world changes → successful systems create new dependencies → an old choice returns several shifts later → player recognizes causality → only then does the game reveal the technical name → after ten shifts the same idea becomes persistent Python state**.

## Implemented in 14.0

- ten authored CITY THREADS shifts with recurring cast;
- five recurring people/roles rather than anonymous mission cards;
- districts unlocked by the player's own infrastructure choices;
- delayed hidden echoes that become visible only when their future turn arrives;
- success-causes-load stories: future problems can be consequences of success, not only mistakes;
- independent long-horizon reserves: continuity, slack and clarity;
- Q-Bot partnership separated from raw authority;
- progressive autonomy rewards proof-ladder/pair-work more than broad permission;
- multiple valid choices with materially different reserves;
- deterministic `CITY CYCLE #seed` replay loop;
- real CPython/Pyodide master path: `orchestrate(event, memory)` with state persisting between events;
- profile schema v13 with merge-safe episodes, districts, echoes, cycles and orchestrator mastery;
- explicit v12 → v13 migration;
- sync schema v13 accepts legacy v2–v12 envelopes;
- new rank `LIVING SYSTEMS ARCHITECT`;
- touch-first responsive CITY THREADS layout and reduced-motion contract.

## Working-tree verification

- Node regression: **358 / 358 PASS**.
- Negative-control selftest: **PASS** — injected bad outcomes are detected.
- Content verifier: **154 tasks · 0 errors · 0 trivial**.
- JavaScript syntax: **76 / 76 files PASS**.
- Main DOM: **738 IDs · 738 unique · 0 duplicates**.
- Replay DOM: **9 IDs · 9 unique · 0 duplicates**.
- Direct runtime ID selectors: **658 uses · 457 unique IDs · 0 missing**.
- CITY ORCHESTRATOR reference policy is also executed through system CPython in tests.

## Profile / sync boundary

- local profile: `quequest.campus.v13`;
- legacy local profiles v1–v12 accepted for migration;
- sync envelope: `quequest.campus.v13`;
- legacy server envelopes v2–v12 remain mergeable;
- episode/cycle XP rewards are keyed by durable reason and do not duplicate on merge;
- save/export contains no auth token, provider credential or LLM key.

## What this release does NOT claim

- Automated tests do not prove that delayed echoes are emotionally satisfying or memorable.
- Automated tests do not prove that ten shifts are perfectly paced for a first-time player.
- Automated tests do not prove that recurring characters create attachment.
- It does not claim measured 20+ hour playtime.
- It does not require or simulate access to real external targets.
- Physical acceptance on a real phone remains a human/device check.

## ZIP verification

The release archive was unpacked into a clean directory and verified again from the unpacked bytes:

- Node regression: **358 / 358 PASS**.
- Negative-control selftest: **PASS**.
- Content verifier: **154 tasks · 0 errors · 0 trivial**.
- JavaScript syntax: **76 / 76 files PASS**.
- Main DOM: **738 IDs · 738 unique · 0 duplicates**.
- Replay DOM: **9 / 9 IDs present and unique**.
- Direct runtime ID selectors: **658 uses · 457 unique IDs · 0 missing**.

The final package differs from that smoke-tested archive only by this release-pass text being updated from pending to the verified results above; the final package is unpacked and regression-tested once more after repacking.
