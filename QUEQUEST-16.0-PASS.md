# QueQuest 16.0 · Release Pass

## Release thesis

16.0 changes the first hour of QueQuest and turns the 15.0 RPG professions into **different games to touch**, not seven labels over the same interaction. The player starts with a physical problem and a small act of rebellion/curiosity, learns only enough shared programming language to unlock doors, then can specialize early.

The progression stays game-first:

**physical frustration / mystery → useful action in the world → visible consequence → reusable ability → real Python form → a profession that uses the same idea differently**.

Programming is the connective tissue between the worlds, not the reason the player is asked to care about them.

## Implemented in 16.0

- new pseudo-first-person `FIRST SHIFT` opening before the classic core scene;
- three manually carried crates, a visibly twitching robotic arm, boss interruption, door-slam beat and the dropped PY chip;
- player may continue carrying extra crates for money instead of immediately approaching the chip;
- manual-shift pay is transferred into the normal QueQuest warehouse wallet rather than being decorative prologue currency;
- the chip interaction hands control back to the existing core world so the old physical-programming progression remains intact;
- subtle pointer-driven 2.5D perspective, first-person hands, boss silhouette, robot/chip motion and reduced-motion fallbacks;
- early `✦ ПРОФЕССИИ` door appears during foundational learning after `PRINT`, rather than hiding specialization until the late campaign;
- all seven Career Worlds remain visible even while locked, so missing abilities act as desirable keys rather than invisible prerequisites;
- differentiated gates based on shared foundation abilities (`print`, `if`, `for`, `while`, `def`);
- seven distinct Career World mechanics instead of one reskinned card loop:
  - AUTO · `PIPELINE` — build/run a physical production flow;
  - VEHICLE · `INVESTIGATE` — inspect an owned synthetic car through hotspots and evidence;
  - SECURITY · `FORTIFY` — build protection first, then red-team the owned synthetic system;
  - WEB · `TYCOON` — spend a constrained CR budget and observe a day of users;
  - AI · `TRAIN` — change Q-Bot experience, uncertainty and authority separately;
  - SYSTEMS · `GRAPH` — change dependencies and observe cascading behavior;
  - LOW · `BITS` — manipulate actual bit state rather than selecting vocabulary;
- robust and seductive-but-wrong approaches are represented in the mechanics, not only in explanation text;
- profile schema v15 with merge-safe Career World runs/wins/best scores;
- explicit v14 → v15 migration and sync v15 accepting legacy v2–v14 envelopes;
- new rank `CAREER ARCHITECT`;
- curated Kenney asset subset from the user-supplied archive instead of bundling the full asset library;
- runtime asset names and security tests preserve the existing synthetic/authorized security boundary;
- cache-bust updated for the 16.0 runtime/campus/profile modules.
- FIRST SHIFT extra-pay loop is physical: take another crate → hands occupied → pallet → pay; the chip cannot be used while carrying cargo;
- FIRST SHIFT reticle reference is validated by runtime-asset tests, and the main module cache-bust is `game-160`.

## Working-tree verification

- Node regression: **387 / 387 PASS**.
- Negative-control selftest: **PASS** — deliberately broken Python/content/deploy cases are detected.
- Content verifier: **154 tasks · 0 errors · 0 trivial**.
- JavaScript syntax: **79 / 79 files PASS**.
- Main DOM: **800 IDs · 800 unique · 0 duplicates**.
- Replay DOM: **9 IDs · 9 unique · 0 duplicates**.
- Direct runtime ID selectors: **717 uses · 501 unique IDs · 0 missing**.
- Replay selectors: **9 / 9 present**.
- Dedicated tests cover FIRST SHIFT state transitions, optional manual work, real wage handoff, early Career Door gating, seven mechanic identities, WEB budget behavior, LOW bit state, AI confidence/authority distinction and safe synthetic scope.

## Profile / sync boundary

- local profile: `quequest.campus.v15`;
- legacy local profiles v1–v14 accepted for migration;
- sync envelope: `quequest.campus.v15`;
- legacy server envelopes v2–v14 remain mergeable;
- Career World XP awards use durable unique keys and do not duplicate on merge;
- save/export contains no auth token, provider credential or LLM key.

## Asset / licensing boundary

- the user-supplied `kenney-main.zip` was inspected and a small runtime subset was copied into `assets/kenney16/`;
- runtime subset includes vehicle, robot, industrial and UI pieces needed for the new first-person/career presentation;
- the bundled Kenney license copy documents the CC0 source;
- the large source archive itself is **not** bundled into the release;
- Freesound Foley is not silently scraped or embedded: the desired recordings require account download, so 16.0 keeps synthesized/local fallbacks and documents exact CC0 candidates in `docs/QUEQUEST-ASSET-AUDIT-16.0.md`;
- no Flaticon or FreeSFX bulk assets are bundled because their free-use redistribution/attribution terms are less convenient for a source-distributed project than the chosen CC0 assets.

## What this release does NOT claim

- Automated tests do not prove that the FIRST SHIFT is emotionally funny, frustrating or satisfying to a human.
- Automated tests do not prove that the seven Career Worlds yet feel as deep as seven standalone games; 16.0 establishes distinct interaction identities and modular boundaries for further expansion.
- Pointer-driven perspective is 2D/2.5D presentation, not a real 3D first-person runtime.
- No Unity migration or full 3D world is included.
- Synthetic/owned security and vehicle sandboxes are not real-world attack simulators and do not provide operational intrusion instructions.
- Physical acceptance on a real phone/tablet remains a human/device check.
- It does not claim measured 20+ hour playtime or proven subjective fun.

## ZIP verification

The release archive was unpacked into a clean directory and verified again from the packaged bytes:

- Node regression: **387 / 387 PASS**.
- Negative-control selftest: **PASS**.
- Content verifier: **154 tasks · 0 errors · 0 trivial**.
- JavaScript syntax: **79 / 79 files PASS**.
- Main DOM: **800 IDs · 800 unique · 0 duplicates**.
- Replay DOM: **9 IDs · 9 unique · 0 duplicates**.
- Direct runtime ID selectors: **717 uses · 501 unique IDs · 0 missing**.
- Replay selectors are included in the combined selector audit and all resolve.
- ZIP integrity: **No errors detected**.

The final package is repacked only to include this verified release-pass text, then smoke-tested once more from the repacked bytes.
