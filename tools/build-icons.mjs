/*
 * Собирает иконки шагов из icons/*.svg в один модуль.
 *
 * Почему не <img src="icons/py-print.svg">: так иконка не наследует цвет
 * текста, а весь смысл в том, что она перекрашивается под состояния
 * «пройдено», «доступно» и «закрыто». Инлайн внутрь страницы это решает и
 * заодно убирает шестнадцать отдельных запросов при открытии карты.
 *
 *   node tools/build-icons.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'icons');

const entries = readdirSync(source)
  .filter((name) => name.endsWith('.svg'))
  .sort()
  .map((name) => {
    const svg = readFileSync(join(source, name), 'utf8');
    const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '').trim();
    if (!svg.includes('currentColor')) throw new Error(`${name}: нет currentColor — иконка не перекрасится`);
    if (!/viewBox="0 0 24 24"/.test(svg)) throw new Error(`${name}: viewBox не 0 0 24 24`);
    return [name.replace(/\.svg$/, ''), inner.replace(/\s+/g, ' ')];
  });

const body = entries.map(([id, inner]) => `  '${id}': '${inner.replace(/'/g, "\\'")}',`).join('\n');
writeFileSync(join(root, 'src', 'content', 'icons.js'), `/*
 * Иконки шагов. Файл собран из icons/*.svg скриптом tools/build-icons.mjs —
 * править надо исходные SVG и пересобирать, иначе правка потеряется.
 */

export const stepIcons = {
${body}
};

export const stepIcon = (id) => stepIcons[id] || null;
`);
console.log(`иконок собрано: ${entries.length}`);
