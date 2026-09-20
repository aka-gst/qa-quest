# QueQuest 16.0.1 · immediate test fix

This patch stays on the 16.0 FIRST SHIFT branch. It does not restore the old opening.

Fixed:

- FIRST SHIFT start condition now uses the live `checkpoint=start` state instead of the legacy `scene=prologue` condition, so `НАЧАТЬ СМЕНУ` actually opens the three-crate scene;
- the same live-state check works after `СБРОС`, instead of relying on the checkpoint snapshot captured at page load;
- initial HTML declares `data-started=false`, so the old HUD text cannot flash underneath/through the start card before JavaScript initializes;
- the obsolete `НА САЙТ` control is hidden;
- cryptic top-right glyphs were replaced with explicit labels for hints, sound, trace and reset;
- added `START-QUEQUEST.command` for macOS. Double-click it instead of opening `index.html` with `file://`; ES modules require an HTTP origin in Chrome.
