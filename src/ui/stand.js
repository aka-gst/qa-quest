/*
 * Стенд урока: то, что делает написанный код, видно на самой машине.
 *
 * Замысел простой и общий для всех задач, а не по одной сцене на урок — иначе
 * сорок восемь задач превратились бы в сорок восемь мультиков, которые никто
 * не станет поддерживать. Правило одно:
 *
 *   каждая напечатанная строка выходит на лобовое стекло и моргает поворотником.
 *
 * Отсюда бесплатно получается всё остальное. Задача на print — на стекле
 * появляется твоя строка. Задача на цикл — поворотник моргает столько раз,
 * сколько прошёл цикл. Число — стрелка приборов уходит на его величину.
 * True или False — загорается зелёная или красная лампа допуска. Ошибка —
 * загорается check engine.
 *
 * Никакой настройки в уроках это не требует: механизм читает обычный вывод
 * программы, тот же, что видно в терминале.
 */

import { el } from './dom.js';
import { activeTheme } from './../content/themes.js';
import { CAR } from './pingcar.js';

let timers = [];

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}

const at = (ms, fn) => timers.push(setTimeout(fn, ms));

/** Панель стенда. У истории без машины её пока нет — вернём null и не сломаем. */
export function standPanel() {
  if (activeTheme().id !== 'garage') return null;
  const box = el('div', { class: 'stand' });
  box.innerHTML = CAR;
  return el('div', { class: 'stand-wrap' }, [
    el('div', { class: 'stand-head' }, [
      el('span', { text: 'СТЕНД' }),
      el('small', { class: 'stand-note', text: 'что сделал твой код' }),
    ]),
    box,
  ]);
}

function hud(svg, text) {
  const node = svg.querySelector('.pc-hud text');
  if (!node) return;
  // На стекле помещается около сорока знаков; длинную строку обрезаем, а не
  // ужимаем шрифт: нечитаемая строка хуже обрезанной.
  node.textContent = text.length > 40 ? `${text.slice(0, 39)}…` : text;
}

/**
 * Проигрывает результат запуска на машине.
 * Берёт обычный вывод программы — тот же, что показан в терминале.
 */
export function standPlay(result) {
  const wrap = document.querySelector('.stand-wrap');
  if (!wrap) return;
  const svg = wrap.querySelector('svg');
  const note = wrap.querySelector('.stand-note');
  clearTimers();
  svg.classList.remove('fault', 'ok', 'no', 'lights');

  if (result.error) {
    svg.classList.add('fault');
    hud(svg, result.error.type || 'ошибка');
    note.textContent = 'блок отказал';
    return;
  }

  const lines = (result.stdout || '').split('\n').filter((line) => line.trim() !== '');
  if (!lines.length) {
    hud(svg, 'тишина — программа ничего не вывела');
    note.textContent = 'ничего не пришло';
    return;
  }

  note.textContent = lines.length === 1
    ? 'на стекло вышла строка'
    : `поворотник моргнул ${lines.length} раз${lines.length < 5 ? 'а' : ''}`;

  lines.forEach((line, index) => {
    const start = index * 520;
    at(start, () => {
      hud(svg, line);
      svg.classList.add('blink');
      const value = Number(line.replace(',', '.'));
      if (Number.isFinite(value)) {
        // Стрелка идёт от нуля до упора: важно не точное значение, а то, что
        // число из кода двигает железо.
        svg.style.setProperty('--needle', `${Math.max(-1, Math.min(1, value / 200)) * 62}deg`);
      }
      const flag = line.trim();
      svg.classList.toggle('ok', flag === 'True');
      svg.classList.toggle('no', flag === 'False');
    });
    at(start + 240, () => svg.classList.remove('blink'));
  });
}
