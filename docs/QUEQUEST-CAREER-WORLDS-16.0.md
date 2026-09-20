# QueQuest 16.0 · CAREER WORLDS

## Thesis

16.0 changes the first hour of QueQuest, not just the postgame. The common Python foundation remains, but it is reframed as a set of **keys that open different games**.

Core rhythm:

**physical frustration → curiosity → small programmable power → visible career door → profession-specific play → technical name only after the world meaning exists**.

The player does not need to love every branch. The goal is that someone can fall in love with the garage, factory, server defense, web shop, Q-Bot training, systems map or low-level machine and still remain inside one coherent game about programmable systems.

## FIRST SHIFT · pseudo-first-person opening

The fresh-game opening is now a separate playable scene.

1. The boss assigns the player to replace Vasya and carry boxes manually.
2. Robot arm 07 visibly twitches. It is not dead; something is missing.
3. The player physically moves three boxes: select crate → deliver to pallet.
4. The boss returns, complains about speed and says the player cannot even repair the arm.
5. After he leaves, a PY chip is visible near the door.
6. The player may keep carrying boxes for +$120 each or approach the chip.
7. The existing QueQuest chip/install/robot sequence takes over.

The extra manual boxes are not fake UI money: earnings are carried into the normal warehouse state.

The scene is intentionally 2.5D rather than a new engine: perspective floor/walls, mouse look, first-person hands, intermittent robot twitch, boss entrance, door beat and a diegetic chip. Mobile keeps the same interaction through tap targets.

## Foundation as access keys

Career Worlds no longer wait for Engineer Campus. After the first `PRINT` ability, a persistent `✦ ПРОФЕССИИ` signal becomes visible during the main game. It reports how many of seven doors are currently usable. Locked branches remain visible.

Current gates:

- VEHICLE: PRINT + IF
- AUTOMATION: PRINT + IF + FOR
- SECURITY: PRINT + IF + FOR
- WEB: PRINT + IF + FOR
- AI: PRINT + IF + FOR + FUNCTION
- LOW LEVEL: PRINT + IF + FOR + FUNCTION
- SYSTEMS: PRINT + IF + FOR + WHILE

This is not meant to say those language constructs are the complete real-world prerequisites. They are game progression keys: the player first proves a small transferable idea, then sees it reappear in another fantasy.

## Seven worlds must feel different

All seven realms share one profile and one foundational logic, but 16.0 gives each a different micro-loop instead of recoloring one quiz.

### AUTOMATION · PIPELINE

A small production line. Player adds buffer/workers and observes flow. The seductive shortcut is dropping excess work. Later this grows toward Factory Nexus / Automation Commons.

### VEHICLE · INVESTIGATE

Garage detective play. The player inspects OWNER and GATEWAY hotspots on an owned synthetic car. The infotainment/radio is a plausible distraction. Success requires two pieces of evidence before the trust boundary makes sense.

### SECURITY · FORTIFY

Build/defend/red-team sandbox on the player's own synthetic server. Player places role boundaries and negative tests, then launches a local night raid. Simply shutting the server down stops the raid but also fails the actual service contract.

### WEB · TYCOON

Two budget tokens, a day of incoming users, and three possible investments. Cache + queue can survive the day; spending scarce budget on a cosmetic banner creates a visible business/system consequence. This is the seed of a future web/service tycoon rather than a form about HTTP vocabulary.

### AI · TRAIN

The player changes Q-Bot's experience. Counterexamples reduce unjustified confidence; abstention teaches an unknown state; giving authority alone makes confidence louder without adding knowledge. The unknown case is tested only after training.

### SYSTEMS · GRAPH

A dependency graph with a shared failing node. The player changes relationships using isolation/fallback rather than treating each red service independently. Retry-storm remains a tempting bad move.

### LOW LEVEL · BITS

A literal state puzzle. The machine begins at `0000`; the current door asks for `0011`. Player toggles bits before technical register vocabulary is introduced. The point is to make state and representation physical first.

## Modular boundary

`src/game/career-worlds.js` owns the seven career micro-loops. `src/game/first-shift.js` owns the opening warehouse scene. Both are separate from the old core model so future work can deepen one profession without rewriting the others.

This is deliberate preparation for larger vertical slices:

- VEHICLE can later become a larger garage scene;
- AUTO can become a factory floor;
- SECURITY can become a build/defend map;
- WEB can become a small service/business simulation;
- AI can become a persistent companion room;
- LOW can become signal/memory/device puzzles.

The common profile remains the bridge between them.

## Art direction in 16.0

A curated subset of the uploaded Kenney archive is included instead of copying the full ~151 MB source pack. The release currently uses only the pieces needed for readable mechanics: car, robot, industrial signs/computer, sci-fi reticle/panel and garage props.

The uploaded archive also contains usable 3D factory and car GLB assets. They are intentionally **not** shipped in 16.0. They remain a strong option for one later browser/3D garage or factory vertical slice after the 2D career loops are playtested.

## What needs human playtest

Automation tests can prove progression, state, safe boundaries and persistence. They cannot prove:

- that the boss/chip beat lands emotionally;
- that manual crate carrying is long enough to create desire but not irritation;
- that Career Door appears at the right moment;
- that the seven worlds truly feel different to non-programmers;
- which profession people voluntarily return to;
- whether 2.5D first-person is enough or one profession deserves a real 3D slice.
