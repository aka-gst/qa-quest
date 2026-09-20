# QueQuest 13.0 · Release Pass

## Release thesis

13.0 adds **CITY WEAVE**: the player's infrastructure is now part of city life. Engineering choices no longer change only queue depth or latency. They change who keeps access, how much unfinished work survives failure, how much trust the system earns and how much authority Q-Bot is allowed to exercise.

The progression remains game-first:

**person notices consequence → player sees dependency → chooses a promise → lives through one shift → sees trade-off → later learns the technical name → eventually writes the policy in Python**.

## Implemented in 13.0

- five authored CITY WEAVE shifts;
- five visible districts/services with local trust memory;
- independent city signals: trust, resilience, access and throughput;
- visible Q-Bot autonomy instead of a hidden “AI level”;
- multiple valid compromises rather than one designer answer;
- one-shift simulation before a choice can be committed;
- brittle accumulated history can block a growth-first city-council ending until weak signals recover;
- deterministic `CITY SEASON #seed` replay loop;
- real CPython/Pyodide master path: `govern(event, city) -> auto / human / defer`;
- capability/confidence/authority remain separate in hidden behavioral checks;
- campus profile schema v12 with merge-safe authored decisions, city seasons and governor mastery;
- explicit migration from v11;
- sync schema v12 accepts legacy v2–v11 envelopes;
- new long-game rank `CIVIC ARCHITECT`;
- touch-first responsive CITY WEAVE layout and reduced-motion contract;
- cache-bust bumped for main/campus/profile runtime.

## Working-tree verification

- Node regression: **346 / 346 PASS**.
- Negative-control selftest: **PASS** — injected bad outcomes are detected.
- Content verifier: **154 tasks · 0 errors · 0 trivial**.
- JavaScript syntax: **75 / 75 files PASS**.
- Main DOM: **700 IDs · 700 unique · 0 duplicates**.
- Replay DOM: **9 IDs · 9 unique · 0 duplicates**.
- Direct runtime ID selectors: **626 uses · 436 unique IDs · 0 missing**.
- CITY GOVERNOR reference policy is also executed through system CPython in tests.

## Profile / sync boundary

- local profile: `quequest.campus.v12`;
- legacy local profiles v1–v11 are accepted for migration;
- sync envelope: `quequest.campus.v12`;
- legacy server envelopes v2–v11 remain mergeable;
- CITY WEAVE rewards are unique by durable arc/seed reason and do not duplicate on merge;
- the profile stores decision signatures, not a mutable “happiness” score;
- no auth token, provider credential or LLM key is added to save/export.

## What this release does NOT claim

- Automated tests do not prove that a complete beginner instantly understands trust/resilience/access/throughput.
- Automated tests do not prove that the player emotionally cares about districts or residents.
- Automated tests do not prove that choosing trade-offs feels fun instead of analytical; this requires human playtest.
- It does not claim measured 20+ hour playtime.
- It does not add a real external provider, email/calendar account or live network target as a gameplay requirement.
- Physical acceptance on a real phone remains a human/device check; narrow-layout contracts are not a substitute.

## ZIP verification

The release archive was unpacked into a clean directory and verified again from the unpacked bytes:

- Node regression: **346 / 346 PASS**.
- Negative-control selftest: **PASS**.
- Content verifier: **154 tasks · 0 errors · 0 trivial**.
- JavaScript syntax: **75 / 75 files PASS**.
- Main DOM: **700 IDs · 700 unique · 0 duplicates**.
- Replay DOM: **9 / 9 IDs present and unique**.
- Direct runtime ID selectors: **626 uses · 436 unique IDs · 0 missing**.

The final package differs from that smoke-tested archive only by this release-pass text being updated from pending to the verified results above; a compact final-package smoke is repeated after repacking.
