import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const mapSource = () => readFile(new URL('../src/ui/map.js', import.meta.url), 'utf8');
const readmeSource = () => readFile(new URL('../README.md', import.meta.url), 'utf8');

test('first screen sells a night to complete, not a Python course', async () => {
  const source = await mapSource();

  assert.match(source, /Это ночь, которую нужно пройти/);
  assert.match(source, /Первый ход — три минуты/);
  assert.doesNotMatch(source, /Это курс питона с нуля/);
});

test('the two later practicums are one quest block with two named routes', async () => {
  const source = await mapSource();

  assert.match(source, /Две дороги после первой ночи/);
  assert.match(source, /ПРОВЕРИТЬ СИСТЕМУ/);
  assert.match(source, /СОБРАТЬ АГЕНТА/);
});

test('README describes the new game route, not the retired course modes', async () => {
  const source = await readmeSource();

  assert.match(source, /Игра о человеке/);
  assert.match(source, /сначала игрок таскает ящики сам/);
  assert.match(source, /боты, агенты, собственный AI/);
  assert.doesNotMatch(source, /Две истории, один полный маршрут|Два режима на одном материале/);
});
