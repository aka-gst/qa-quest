import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const audio=readFileSync(new URL('../src/game/audio.js',import.meta.url),'utf8');
const deploy=readFileSync(new URL('./deploy.sh',import.meta.url),'utf8');

const runtimeAssets=[
  'assets/audio/kenney/click.wav',
  'assets/ui/kenney-game-icons/signal3.png',
  'assets/ui/kenney-game-icons/save.png',
  'assets/kenney16/industrial/warning.png',
  'assets/kenney16/industrial/computer.png',
  'assets/kenney16/ui/reticle.png',
  'assets/kenney16/ui/panel.png',
  'assets/kenney16/robot/robot_yellowBody.png',
  'assets/kenney16/robot/robot_yellowDrive1.png',
  'assets/kenney16/robot/robot_yellowDamage1.png',
  'assets/kenney16/garage/car_blue_3.png',
  'assets/kenney16/garage/cone_straight.png',
  'assets/kenney16/garage/barrier_red.png',
];

test('small CC0 tactile/UI assets used by runtime exist with local provenance notices',()=>{
  for(const rel of runtimeAssets) assert.ok(existsSync(new URL(`../${rel}`,import.meta.url)),rel);
  assert.match(html,/assets\/ui\/kenney-game-icons\/signal3\.png/);
  assert.match(html,/assets\/ui\/kenney-game-icons\/save\.png/);
  assert.match(audio,/assets\/audio\/kenney\/click\.wav/);
  for(const rel of ['assets/audio/kenney/LICENSE.txt','assets/ui/kenney-game-icons/LICENSE.txt','assets/kenney16/LICENSE.txt']){
    const text=readFileSync(new URL(`../${rel}`,import.meta.url),'utf8');
    assert.match(text,/CC0|Creative Commons Zero/i);
    assert.match(text,/Kenney/i);
  }
});

test('deploy whitelist includes the runtime assets tree',()=>{
  assert.match(deploy,/--include 'assets\/' --include 'assets\/\*\*'/);
});


test('all static Kenney16 references in shipped HTML/CSS/game modules resolve to local files',()=>{
  const sources=[
    html,
    readFileSync(new URL('../styles.css',import.meta.url),'utf8'),
    ...['first-shift.js','career-worlds.js','main.js'].map(name=>readFileSync(new URL(`../src/game/${name}`,import.meta.url),'utf8')),
  ].join('\n');
  const refs=[...sources.matchAll(/assets\/kenney16\/[A-Za-z0-9_./-]+/g)].map(m=>m[0]);
  assert.ok(refs.length>=3,'expected Kenney16 runtime references');
  for(const rel of new Set(refs)) assert.ok(existsSync(new URL(`../${rel}`,import.meta.url)),`missing runtime asset: ${rel}`);
});
