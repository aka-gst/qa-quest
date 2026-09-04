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
    'machinePanel',
    'codeInput',
    'runCode',
    'gameMessage',
    'soundToggle',
    'restartGame',
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `нет #${id}`);
  }
  assert.doesNotMatch(html, /class=["']power-rack["']/, 'старые ручные способности всё ещё видны');
});

test('первый экран обещает игру, а не учебный курс', () => {
  assert.match(html, /Ты всё умел\. Теперь вспомни\./);
  assert.match(html, /WASD · МАНЕВРИРУЙ · ОРУДИЕ СТРЕЛЯЕТ САМО/);
  assert.doesNotMatch(html, /коротк|подробн|урок|обучени/i);
});

test('терминал не выдаёт первую команду до находки плаката', () => {
  const editor = html.match(/<textarea[^>]*id=["']codeInput["'][^>]*>([\s\S]*?)<\/textarea>/)?.[1];
  assert.equal(editor, '');
  assert.doesNotMatch(html, /Отправь первое слово/);
});

test('основное действие на телефоне остаётся большой кнопкой', () => {
  const mobileBlock = css.match(/@media \(max-width: 760px\) \{([\s\S]*?)\n\}/)?.[1] ?? '';
  const height = Number(mobileBlock.match(/\.action-button \{[^}]*height:\s*([\d.]+)px/)?.[1]);

  assert.ok(Number.isFinite(height), 'не найдена мобильная высота .action-button');
  assert.ok(height >= 44, `основное действие меньше 44px: ${height}px`);
});

test('рождение иного разума видно и доступно не только через canvas', () => {
  assert.match(html, /id=["']otherMindStatus["'][^>]*aria-live=["']polite["']/);
  assert.match(html, /class=["']other-mind-glyph["'][^>]*aria-hidden=["']true["']/);
  assert.match(html, /СЕМЯ ИНОГО РАЗУ/);
  assert.match(css, /\.other-mind-status\[data-phase=["']waking["']\]/);
  assert.match(css, /\.other-mind-status\[data-phase=["']awake["']\]/);
  assert.match(css, /\.other-mind-status\[data-phase=["']silent["']\]/);
  const glyph = css.match(/\.other-mind-glyph\s*\{([^}]*)\}/)?.[1] ?? '';
  const width = Number(glyph.match(/width:\s*([\d.]+)px/)?.[1]);
  const height = Number(glyph.match(/height:\s*([\d.]+)px/)?.[1]);
  assert.ok(width >= 44 && height >= 44, `семя меньше 44px: ${width}×${height}`);
  assert.doesNotMatch(css, /other-mind[^;}]*animation:[^;}]*infinite/);
});

test('сниженная анимация сохраняет читаемые состояния семени', () => {
  const reducedMotion = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/)?.[1] ?? '';
  assert.match(reducedMotion, /\.other-mind-status/);
  assert.match(reducedMotion, /animation:\s*none/);
});
