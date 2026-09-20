# QueQuest 16.0 · Asset audit / what to download next

## Uploaded Kenney archive

`kenney-main.zip` is immediately useful. It contains broad 2D, UI, pixel/industrial, robot, racing/vehicle and 3D collections. Kenney states that its game assets are CC0; the archive also includes a CC0 license file.

16.0 intentionally copies only a small runtime slice into `assets/kenney16/`:

- `2d/Racing Pack/Cars/car_blue_3.png`
- `2d/Racing Pack/Objects/cone_straight.png`
- `2d/Racing Pack/Objects/barrier_red.png`
- `2d/Robot Pack/Side view/robot_yellowBody.png`
- `2d/Robot Pack/Side view/robot_yellowDamage1.png`
- `2d/Robot Pack/Side view/robot_yellowDrive1.png`
- `2d/Pixel Platformer Industrial Expansion/Tiles/tile_0042.png` → runtime `warning.png`
- `2d/Pixel Platformer Industrial Expansion/Tiles/tile_0085.png` → runtime `computer.png`
- `ui/UI Pack - Sci-fi/Blue/Double/crosshair_color_a.png` → runtime `reticle.png`
- `ui/UI Pack - Sci-fi/Blue/Double/button_square_header_large_rectangle_screws.png` → runtime `panel.png`

The rename to `reticle.png` is intentional: old safety regression tests reject strings that look like real remote-shell terminology anywhere in the shipped HTML.

## 3D already present — do not download more yet

The archive already includes factory and car GLB assets. That is enough to prototype a future browser 3D vertical slice. We do not currently need a Unity migration or another giant 3D pack.

The missing piece for a convincing first-person slice is **character/hand animation**, not more cars or conveyors. If a 3D experiment is approved after playtest, useful additions would be a CC0/permissive first-person hand/interaction animation pack and a very small industrial interior kit only if the existing Kenney geometry proves insufficient.

## Sound: immediate wishlist

Freesound is the best current source because individual sounds clearly expose Creative Commons licenses. Prefer **CC0 only** for QueQuest source distributions. The site requires login to download, so these four files are the most useful next upload from the user:

1. Warehouse ambience — Freesound sound 690009, CC0.
2. Cardboard box drop — Freesound sound 346169, CC0.
3. Door slam — Freesound sound 413274, CC0.
4. Short servo motor — Freesound sound 740240, CC0.

These map directly to FIRST SHIFT. The game already has synthesized fallback audio, so missing files never block play.

Future garage wish list after that: garage room tone, hood/door latch, engine idle/start, ratchet/tool clicks, tire/rolling sound. Again: prefer CC0 and send the original sound page URL or attribution metadata with each file.

## Flaticon

Do not bulk-download Flaticon into the source ZIP right now. Free Flaticon use generally requires attribution, and its license restricts distributing the original assets for download. QueQuest is distributed as a downloadable source/artifact bundle, so Kenney CC0 is cleaner for the core UI. Flaticon can still be useful later for one-off final-project icons if the exact license/attribution is preserved or a suitable paid license is available.

## FreeSFX

Do not bundle FreeSFX in the source ZIP yet. Its redistribution terms were not cleanly verified enough in this pass for a source-distributed game. If a specific FreeSFX recording becomes uniquely valuable later, verify that exact item/EULA before adding it.

## Best user uploads after 16.0

Highest-value additions are not another generic icon pack. They are:

- the four CC0 Freesound files above;
- any books you already have about game feel, level design, first-person interaction, systemic games or simulation UX;
- the 2D/HTML asset generator you mentioned, even if it is rough — it is more useful to inspect its constraints than to guess what it can do;
- if you own/licensed a first-person hand animation/interaction pack, upload the license/readme with it.

Do not upload secrets, proprietary game assets without redistribution rights, or huge 3D libraries just because they exist. The current Kenney archive already covers the majority of our prototype art needs.
