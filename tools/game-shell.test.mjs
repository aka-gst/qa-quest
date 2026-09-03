import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('страница запускает только новую игру', () => {
  assert.match(html, /src\/game\/main\.js/);
  assert.doesNotMatch(html, /src\/main\.js/);
  assert.doesNotMatch(html, /qaquest\.v2|lessonScreen|mapScreen/);
});

test('игровая оболочка содержит нужные органы управления', () => {
  for (const id of [
    'gameCanvas',
    'gameHud',
    'missionText',
    'actionButton',
    'powerDash',
    'powerPulse',
    'powerShield',
    'machinePanel',
    'codeInput',
    'runCode',
    'gameMessage',
    'soundToggle',
    'restartGame',
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `нет #${id}`);
  }
});

test('первый экран обещает игру, а не учебный курс', () => {
  assert.match(html, /Ты всё умел\. Теперь вспомни\./);
  assert.match(html, />\s*Двигайся\s*</);
  assert.doesNotMatch(html, /коротк|подробн|урок|обучени/i);
});

test('подписи мобильных способностей остаются читаемыми', () => {
  const mobileBlock = css.match(/@media \(max-width: 760px\) \{([\s\S]*?)\n\}/)?.[1] ?? '';
  const fontSize = Number(mobileBlock.match(/\.power b \{[^}]*font-size:\s*([\d.]+)px/)?.[1]);

  assert.ok(Number.isFinite(fontSize), 'не найден размер подписи .power b в мобильном CSS');
  assert.ok(fontSize >= 10, `подпись способности слишком мелкая: ${fontSize}px`);
});
