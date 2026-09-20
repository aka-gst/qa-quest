import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AMBIENT_RECIPES, EXTERNAL_SOUNDS, quietFrom, SOUND_RECIPES } from '../src/game/audio.js';

test('немой адрес понимает русское и латинские написания', () => {
  for (const value of ['?тихо', '?%D1%82%D0%B8%D1%85%D0%BE', '?tiho=1', '#quiet=true']) {
    assert.equal(quietFrom(value, ''), true, value);
  }
});

test('немой адрес не срабатывает внутри чужого слова и не падает на битом проценте', () => {
  for (const value of ['?тихонько', '?disquiet', '?l=ABC', '?%']) {
    assert.equal(quietFrom(value, ''), false, value);
  }
});

test('важные звуки громче интерфейсных, но ни один рецепт не клипует', () => {
  assert.ok(SOUND_RECIPES.collapse.gain > SOUND_RECIPES.pickup.gain);
  assert.ok(SOUND_RECIPES.reward.gain > SOUND_RECIPES.wake.gain);
  assert.ok(SOUND_RECIPES.cannon.gain > SOUND_RECIPES.pickup.gain);
  assert.ok(SOUND_RECIPES.impact.gain > SOUND_RECIPES.pickup.gain);
  assert.ok(SOUND_RECIPES.cannon.duration < 0.2);
  for (const recipe of Object.values(SOUND_RECIPES)) {
    assert.ok(recipe.gain > 0 && recipe.gain <= 0.18);
    assert.ok(recipe.duration >= 0.04 && recipe.duration <= 0.8);
  }
});

test('склад рассказывает действия разными звуками', () => {
  assert.ok(SOUND_RECIPES.door.duration >= .2);
  assert.ok(SOUND_RECIPES.poster.duration >= .15);
  assert.ok(SOUND_RECIPES.power.duration >= .35);
  assert.notEqual(SOUND_RECIPES.door.frequency, SOUND_RECIPES.poster.frequency);
  assert.notEqual(SOUND_RECIPES.poster.frequency, SOUND_RECIPES.power.frequency);
});

test('после первого действия у сцен есть тихий непрерывный фон', () => {
  assert.ok(AMBIENT_RECIPES.warehouse.gain > 0 && AMBIENT_RECIPES.warehouse.gain < .04);
  assert.ok(AMBIENT_RECIPES.combat.gain > 0 && AMBIENT_RECIPES.combat.gain < .04);
  assert.notEqual(AMBIENT_RECIPES.warehouse.frequency, AMBIENT_RECIPES.combat.frequency);
});


test('внешний UI click локален, мал и имеет CC0 provenance рядом с файлом', () => {
  const here=path.dirname(fileURLToPath(import.meta.url));
  const root=path.resolve(here,'..');
  const rel=EXTERNAL_SOUNDS['ui-click'];
  assert.equal(rel,'assets/audio/kenney/click.wav');
  const file=path.join(root,rel);
  const license=path.join(root,'assets/audio/kenney/LICENSE.txt');
  assert.ok(fs.existsSync(file));
  assert.ok(fs.statSync(file).size > 100 && fs.statSync(file).size < 100_000);
  const text=fs.readFileSync(license,'utf8');
  assert.match(text,/Creative Commons Zero|CC0/i);
  assert.match(text,/Kenney/i);
  assert.ok(SOUND_RECIPES['ui-click'], 'synth fallback must remain if sample playback is unavailable');
});
