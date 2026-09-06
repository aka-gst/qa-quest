import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHIP_SHOWCASE_DURATION, CHIP_SHOWCASE_PHASES, getChipShowcasePhase } from '../src/game/showcase-chip.js';

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
    'pythonChip',
    'machinePanel',
    'codeInput',
    'runCode',
    'gameMessage',
    'soundToggle',
    'restartGame',
    'storageWarning',
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `нет #${id}`);
  }
  assert.doesNotMatch(html, /class=["']power-rack["']/, 'старые ручные способности всё ещё видны');
});

test('первый Python-чип остаётся действием игрока и имеет витринный адрес', () => {
  assert.match(html, /id=["']pythonChip["']/);
  assert.match(html, /ВСТАВИТЬ ЧИП PYTHON/);
  assert.match(readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8'), /query\.get\('showcase'\) === 'chip'/);
  assert.match(readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8'), /state\.arm\.chip === 'installed'\) openMachinePanel\(\)/);
});

test('витрина чипа показывает шесть событий в заданном порядке и зацикливается', () => {
  assert.deepEqual(CHIP_SHOWCASE_PHASES.map(({ id }) => id), ['boxes', 'boss', 'scatter', 'insert', 'terminal', 'wake']);
  assert.equal(CHIP_SHOWCASE_DURATION, 9000);
  assert.equal(getChipShowcasePhase(0).id, 'boxes');
  assert.equal(getChipShowcasePhase(3000).id, 'boss');
  assert.equal(getChipShowcasePhase(4200).id, 'scatter');
  assert.equal(getChipShowcasePhase(5200).id, 'insert');
  assert.equal(getChipShowcasePhase(6300).id, 'terminal');
  assert.equal(getChipShowcasePhase(7500).id, 'wake');
  assert.equal(getChipShowcasePhase(CHIP_SHOWCASE_DURATION).id, 'boxes');
});

test('ручная витрина — отдельная сцена героя, а не запись движения курсора', () => {
  const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
  const render = readFileSync(new URL('../src/game/render.js', import.meta.url), 'utf8');
  assert.match(main, /query\.get\('showcase'\) === 'manual'/);
  assert.match(main, /manualShowcase: showcaseManual/);
  assert.match(main, /chipShowcase: showcaseChip/);
  assert.match(render, /ПЕРЕНЕСИ ТРИ ЯЩИКА/);
  assert.match(render, /const boxDuration = 1000/);
  assert.match(render, /ЧЕЛОВЕК ИДЁТ ОБРАТНО/);
  assert.match(render, /cubic-bezier\(0\.4, 0, 0\.2, 1\)/);
});

test('на телефоне кнопка действия не обещает клавишу Space', () => {
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.action-button__key \{ display: none; \}/);
  assert.match(readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8'), /action-button__key'\)\.hidden = narrowViewport\.matches/);
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

test('обрывок с найденной командой остаётся внутри открытого терминала', () => {
  assert.match(html, /id=["']machineClue["']/);
  assert.match(html, /print\(&quot;wake&quot;\)/i);
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
  assert.doesNotMatch(css, /\.machine \.other-mind-status\s*\{[^}]*display:\s*none/);
});

test('первая автоматизация оставляет способность в дневнике, а не только деньги', () => {
  assert.match(html, /id=["']skillJournal["']/);
  assert.match(html, /id=["']printSkill["']/);
  assert.match(html, /PRINT/);
  assert.match(html, /Машина не устала\. Машина вообще не поняла, что сегодня была смена\./);
  assert.match(css, /\.skill-journal/);
  assert.match(css, /\.skill-card\[data-unlocked=["']true["']\]/);
});

test('сниженная анимация сохраняет читаемые состояния семени', () => {
  const reducedMotion = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/)?.[1] ?? '';
  assert.match(reducedMotion, /\.other-mind-status/);
  assert.match(reducedMotion, /animation:\s*none/);
});
