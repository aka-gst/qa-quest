# QueQuest 13.0 · CITY WEAVE

## Thesis

CITY WEAVE is the point where QueQuest stops treating the city as a backdrop for engineering problems. The player's systems have become infrastructure. Code choices now change who gets a faster path, who still has access, how much work survives a restart, how much freedom Q-Bot receives and how resilient the city remains when the next failure arrives.

The sequence remains game-first:

**person notices a consequence → player sees the dependency → chooses a promise → lives through one shift → sees the trade-off → only later gets the technical name → eventually writes the policy in Python.**

No beginner is expected to know words like bounded autonomy, checkpoint, provenance or compatibility before the world gives those ideas meaning.

## What is new

### Five authored city shifts

1. **Two Speeds** — a fast path helps large clients while old/small terminals begin falling behind.
2. **A Queue With People In It** — clearing backlog makes metrics green but can erase unfinished work.
3. **Q-Bot Asks For More Authority** — prediction quality and permission to act are separated.
4. **The Archive Remembers More** — more context improves convenience but raises the cost of stale/opaque memory.
5. **City Council** — throughput, access, trust and resilience must be balanced after the previous four decisions.

Each shift offers three meaningful choices. There is intentionally no single hidden “designer answer”. A human fallback can be valid but slow. A dual path can be inclusive but more complex. A bounded automated route can be faster but requires an authority boundary. Some extreme histories can make the final council reject a new growth-first decision until a weak city metric is recovered.

## Persistent consequences

The save file does not store a magic “good city / bad city” morality number. It stores durable decisions such as:

`two-speeds:dual-lane`

The runtime derives the current city state from those decisions. This keeps account merge monotonic and understandable: two devices can union decisions and solved seasons without averaging away history.

Visible city signals:

- **trust** — whether people can rely on what the system says and does;
- **resilience** — whether unfinished work and service survive failures;
- **access** — whether older/smaller paths still have an explicit route;
- **throughput** — how much work the infrastructure can move;
- **Q-Bot autonomy** — how much low-risk action has been delegated.

These are not collapsed into a fake “happiness” score. `cityBalanceScore()` exists for replay scoring only; the UI keeps the individual consequences visible.

## District memory

Five familiar districts/services remain visible:

- Night Market;
- Courier Cooperative;
- City Archive;
- Action Gateway;
- Q-Bot.

Each shift changes the trust of the district most affected by that decision. The left side of the CITY WEAVE screen therefore becomes a readable memory of who has been helped or strained by the player's infrastructure.

## One-shift simulation before commitment

Selecting a policy is not the same as committing it. The player must press **LIVE WITH THIS FOR ONE SHIFT** first. The world then produces three concrete consequence beats and previews the new city pulse. Only a non-catastrophic result can be committed.

This keeps the mechanic from becoming a multiple-choice quiz. The decision is understood through observed consequence.

## Infinite CITY SEASONS

After all five authored shifts, deterministic `CITY SEASON #seed` runs remix the existing tensions with changing pressure/twists. They do not permanently mutate the authored decision history; solved seeds and best balance are recorded for replayability and XP uniqueness.

## Master path: CITY GOVERNOR

After the five shifts, the player can stop using policy cards and write a real Python function:

```python
def govern(event, city):
    # return "auto", "human" or "defer"
    ...
```

Behavioral checks require that:

- unknown capability is deferred;
- high-impact action stays with a human;
- overload defers instead of dropping work;
- low trust prevents automatic action;
- known low-impact action with capacity and trust can be automated.

The important concept is not syntax. It is that **capability, confidence and authority are separate**.

## Q-Bot progression

Q-Bot's visible autonomy grows only through the player's choices. The risky broad-autonomy path can make the city faster and more fragile. Bounded autonomy gives Q-Bot meaningful agency while preserving a high-impact human boundary. `HUMAN APPROVAL` remains a valid, expensive solution rather than a tutorial failure.

## Profile / accounts boundary

13.0 moves the local profile to schema v12.

CITY WEAVE stores only:

- completed authored arcs;
- deterministic season seeds;
- durable decision signatures;
- code-governor mastery;
- best replay balance/score.

No provider keys, account tokens, prompts from external services or real personal data are added to the profile.

Legacy profile v11 is explicitly accepted and migrated into an empty CITY WEAVE history.

## What automated tests can prove

Tests can prove that:

- choices generate different trade-offs;
- autonomy is observable state;
- brittle histories can fail the city-council threshold;
- seasons are deterministic;
- profile merge is monotonic and XP does not duplicate;
- the reference governor passes real CPython behavior checks;
- DOM/touch/reduced-motion contracts exist.

Tests cannot prove that the player emotionally cares about a district, that the metrics are instantly intuitive to a complete beginner, or that choosing a compromise is fun. Those remain explicit human-playtest questions.
