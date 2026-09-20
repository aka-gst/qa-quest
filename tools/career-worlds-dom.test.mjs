import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const index = await readFile(new URL('index.html', root), 'utf8');
const css = await readFile(new URL('styles.css', root), 'utf8');
const main = await readFile(new URL('src/game/main.js', root), 'utf8');
const careers = await readFile(new URL('src/game/career-worlds.js', root), 'utf8');

test('FIRST SHIFT is a real first-person canvas opening, not a prose tutorial',()=>{
  for (const id of ['firstShift','firstShiftCanvas','firstShiftDialogue','firstShiftPrompt']) assert.match(index,new RegExp(`id="${id}"`));
  assert.match(index,/Сегодня ты — вместо Васи/);
  assert.match(index,/WASD · ИДТИ/);
  assert.match(index,/МЫШЬ · СМОТРЕТЬ/);
  assert.doesNotMatch(index,/data-first-crate=/);
  assert.match(css,/unified first-person warehouse pass/);
  assert.match(css,/assets\/kenney16\/ui\/reticle\.png/);
});

test('CAREER WORLDS stay out of the early warehouse story and unlock in postgame',()=>{
  assert.match(index,/id="careerDoor"/);
  assert.match(index,/id="careerWorlds"/);
  assert.match(main,/careerLocked = state\.learning\.chapter < 8/);
  assert.match(main,/careerVisible = !careerLocked && state\.learning\.printUnlocked/);
  assert.match(main,/careerDoorState/);
  assert.match(main,/careerReturnToGuild = false/);
});

test('16.2 keeps the local CC0 Kenney slice for tactile UI and later careers',()=>{
  for (const asset of ['assets/kenney16/garage/car_blue_3.png','assets/kenney16/robot/robot_yellowBody.png','assets/kenney16/ui/reticle.png']) assert.match(index+css+main+careers,new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  for (const visual of ['cw-belt','cw-car','cw-fort','cw-traffic','cw-qbot','cw-graph','cw-bits']) assert.match(css,new RegExp(`\\.${visual}`));
  assert.match(css,/prefers-reduced-motion/);
});

test('career/security presentation stays synthetic and does not embed real attack commands',()=>{
  const lower=(index+main).toLowerCase();
  for (const forbidden of ['nmap -','ssh -','sqlmap','metasploit','msfconsole','hydra -','curl http:\/\/']) assert.equal(lower.includes(forbidden),false,forbidden);
});
