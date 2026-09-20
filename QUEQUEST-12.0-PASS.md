# QueQuest 12.0 · Release Pass

## Release thesis

12.0 adds **CITY CHRONICLE**: the city remembers why old code exists. The player no longer treats every legacy path as trash. Past decisions return in a changed world, the player reconstructs why they were created and who still depends on them, then chooses whether to sunset, adapt, preserve or turn the incident into a new guardrail.

This keeps the QueQuest progression intact:

**observe → understand → act → automate → operate → remember → code**.

## Implemented in 12.0

- five authored CITY CHRONICLE stories;
- at least two historical clues required before a maintenance decision can count;
- visible `LEGACY CABLES` as cost of past compatibility, not a moral “bad code” score;
- multiple valid compromises where appropriate, including knowingly keeping compatibility;
- profile-aware archive echoes that reference the player's own earlier RELEASE WEEK decisions;
- Q-Bot memory drift: a previously correct lesson can become over-general after the world changes;
- deprecation/sunset framed through a rare old client rather than vocabulary-first teaching;
- postmortem story where blame is explicitly not a successful system-learning outcome;
- deterministic `MAINTENANCE WINDOW #seed` replay loop;
- master path with real CPython/Pyodide `compatibility_policy(client_version, supported, sunset)` checks;
- campus profile schema v11 with merge-safe chronicle arcs, windows, decisions, postmortems and code mastery;
- migration from v10 fixed and regression-tested;
- new rank `SYSTEM STEWARD`;
- mobile/touch and reduced-motion contracts for the new overlay;
- cache-bust updated for main/styles/campus/profile modules.

## Working-tree verification

- Node regression: **335 / 335 PASS**.
- Negative-control selftest: **PASS** — injected bad outcomes are detected.
- Content verifier: **154 tasks · 0 errors · 0 trivial**.
- JavaScript syntax: **74 / 74 files PASS**.
- Main DOM: **661 IDs · 661 unique · 0 duplicates**.
- Replay DOM: **9 IDs · 9 unique · 0 duplicates**.
- Direct runtime ID selectors: **595 uses · 416 unique IDs · 0 missing**.
- CITY CHRONICLE reference migration policy is also executed through system CPython in tests.

## Profile / sync boundary

- local profile: `quequest.campus.v11`;
- legacy local profiles v1–v10 are accepted for migration;
- sync envelope: `quequest.campus.v11`;
- legacy server envelopes v2–v10 remain mergeable;
- chronicle rewards are unique by durable reason/seed and do not duplicate on merge;
- no auth tokens or LLM keys are added to the save/export schema.

## What this release does NOT claim

- It does not prove that opening historical clues feels fun rather than like reading; that requires human playtest.
- It does not prove that `LEGACY CABLES` is immediately understood as dependency cost by a beginner.
- It does not prove 20+ hours of measured playtime.
- It does not include a real external provider, email/calendar account or live internet target as a gameplay requirement.
- Physical 390×844 acceptance on a real phone remains a human/device check; automated narrow-layout contracts are not a substitute.

## ZIP verification

The release archive was unpacked into a clean directory and verified again from the unpacked bytes:

- Node regression: **335 / 335 PASS**.
- Negative-control selftest: **PASS**.
- Content verifier: **154 tasks · 0 errors · 0 trivial**.
- JavaScript syntax: **74 / 74 files PASS**.
- Main DOM: **661 IDs · 661 unique · 0 duplicates**.
- Replay DOM: **9 / 9 IDs present and unique**.
- Direct runtime ID selectors: **595 uses · 416 unique IDs · 0 missing**.

The final package differs from that smoke-tested archive only by this release-pass text being updated from “pending” to the verified results above; a compact final-package smoke is repeated after repacking.
