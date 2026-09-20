import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const machine = await readFile(new URL('../src/game/machine.js', import.meta.url), 'utf8');
const main = await readFile(new URL('../src/game/main.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const render = await readFile(new URL('../src/game/render.js', import.meta.url), 'utf8');

test('функция требует один route(batch) и два вызова для линий A/B', () => {
  assert.match(machine, /runFunctionAutomation/);
  assert.match(machine, /сохрани повторяющееся поведение в функции route\(batch\)/);
  assert.match(machine, /подключи функцию к линии A/);
  assert.match(machine, /подключи ту же функцию к линии B/);
  assert.match(machine, /line_a/);
  assert.match(machine, /line_b/);
});

test('UI показывает функцию как отдельный переносимый модуль', () => {
  assert.match(html, /id="functionBuilder"/);
  const builder = html.match(/<div class="function-builder" id="functionBuilder"[\s\S]*?<\/div>/)?.[0] ?? '';
  assert.match(builder, /ПОКАЗАТЬ ПРИМЕР/);
  assert.doesNotMatch(builder, /def route\(batch\):/, 'синтаксис функции не должен быть заранее напечатан в интерфейсе');
  assert.match(html, /id="funcSkill"/);
  assert.match(main, /route\(line_a\)/);
  assert.match(main, /route\(line_b\)/);
  assert.match(main, /ДВЕ ЛИНИИ/);
  assert.match(render, /1 МОДУЛЬ → 2 ЛИНИИ/);
  assert.match(render, /drawFunctionModule/);
});
