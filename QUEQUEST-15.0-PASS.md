# QueQuest 15.0 · Release Pass

## Release thesis

15.0 adds **QUEST GUILD** and changes the shape of QueQuest from “one very long engineering journey” into a **game world with professions and multiple ways to matter**. The player can enter the fantasy that attracts them — garage/vehicle, own server/security, paid automation, AI, systems, web or low-level — without first consuming every other branch.

The progression stays game-first:

**cool job / mystery / owned rig → meaningful action in the world → repeatable capability → RPG skill identity → only then technical vocabulary and Python/AI/system form → harder contracts and complementary party roles**.

Real-world incidents are used as quest inspiration, not as operational walkthroughs. Security and vehicle actions stay on synthetic, owned or explicitly authorized targets; the game teaches diagnosis, trust boundaries, testing and hardening rather than real-world attack steps.

## Implemented in 15.0

- prominent non-linear `QUEST GUILD` available without CITY THREADS as a prerequisite;
- seven RPG skill paths: Automation, AI, Systems, Security, Vehicle, Web and Low Level;
- profession levels `НЕ ПРОБОВАЛ → ПРАКТИК → СПЕЦ → МАСТЕР → ЛЕГЕНДА`;
- old QueQuest progress recognized as character biography / skill history instead of resetting veterans;
- ten authored multi-path story quests;
- restored “own car rig” and “build your own server, then break-test it” game fantasies as independent career paths;
- public real-world engineering stories used as narrative archetypes, with a separate source/transformation dossier;
- deterministic paid `WORK ORDER #seed` loop with CR separated from XP;
- two local party-raid prototypes requiring complementary roles;
- multiple valid approaches to the same quest with different skill growth;
- explicit safe-scope contract for security/vehicle quests and tests against operational attack-command leakage;
- touch-first responsive Guild UI using existing QueQuest art, no 3D runtime prerequisite;
- profile schema v14 with merge-safe quests, choices, jobs, raids, skill ledger and credit ledger;
- explicit v13 → v14 migration and sync v14 accepting legacy v2–v13 envelopes;
- new rank `GUILD ARCHITECT`;
- cache-bust updated to `game-150` for the 15.0 runtime/styles.

## Working-tree verification

- Node regression: **372 / 372 PASS**.
- Negative-control selftest: **PASS** — intentionally broken Python/content/deploy cases are detected.
- Content verifier: **154 tasks · 0 errors · 0 trivial**.
- JavaScript syntax: **77 / 77 files PASS**.
- Main DOM: **769 IDs · 769 unique · 0 duplicates**.
- Replay DOM: **9 IDs · 9 unique · 0 duplicates**.
- Direct runtime ID selectors: **681 uses · 473 unique IDs · 0 missing**.
- Replay selectors: **9 / 9 present**.
- Quest Guild unit tests cover non-linear entry, old-progress recognition, alternative approaches, deterministic jobs, complementary raids and safe synthetic scope.

## Profile / sync boundary

- local profile: `quequest.campus.v14`;
- legacy local profiles v1–v13 accepted for migration;
- sync envelope: `quequest.campus.v14`;
- legacy server envelopes v2–v13 remain mergeable;
- quest/job/raid XP and CR rewards use durable unique keys and do not duplicate on merge;
- save/export contains no auth token, provider credential or LLM key.

## Real-world inspiration boundary

The source dossier is `docs/QUEQUEST-REAL-WORLD-QUEST-SOURCES-15.0.md`. The release draws narrative/system inspiration from publicly documented classes of events including staged-update failures, software supply-chain provenance, shared dependency outages, stale credentials, automotive/embedded security research, chatbot accountability and coding-agent PR/review workflows.

The game does **not** reproduce operational exploit chains, credential-stealing methods, real target instructions, CAN commands, real network scanning commands or access bypass steps. Raid/server/vehicle targets are QueQuest-owned synthetic systems or explicitly authorized practice scopes.

## What this release does NOT claim

- Automated tests do not prove that the Guild feels like an RPG rather than a large menu.
- Automated tests do not prove that the seven professions feel sufficiently different to humans.
- Automated tests do not prove that CR creates a satisfying economy; 15.0 deliberately does not add arbitrary currency sinks before playtesting the job loop.
- Local party composition is not multiplayer or MMO networking.
- 3D is not implemented; it remains a possible vertical-slice experiment after the 2D Guild loop proves fun.
- Public market-demand sources support the existence of paid categories such as scripting/automation; they do not imply guaranteed income or “easy money”.
- It does not claim measured 20+ hour playtime.
- Physical acceptance on a real phone remains a human/device check.

## ZIP verification

The release archive was unpacked into a clean directory and verified again from the packaged bytes:

- Node regression: **372 / 372 PASS**.
- Negative-control selftest: **PASS**.
- Content verifier: **154 tasks · 0 errors · 0 trivial**.
- JavaScript syntax: **77 / 77 files PASS**.
- Main DOM: **769 IDs · 769 unique · 0 duplicates**.
- Replay DOM: **9 / 9 IDs present and unique**.
- Direct runtime ID selectors: **681 uses · 473 unique IDs · 0 missing**.
- Replay selectors: **9 / 9 present**.
- ZIP integrity: **No errors detected**.

The final package is repacked only to include this verified release-pass text and is smoke-tested once more after repacking.
