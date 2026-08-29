/*
 * Живая машина на первом экране.
 *
 * Человек, который никогда не писал кода, читает «код запускается прямо на
 * странице» и не верит: это просто слова на сайте. Здесь он набирает ping car
 * и видит, как моргнули фары. Дальше объяснять не нужно — обещание уже
 * выполнено, до всякого питона.
 *
 * Машина нарисована вектором прямо здесь, а не картинкой: картинка не умеет
 * открывать двери. Всё, что меняется, — это классы на группах.
 */

import { el } from './dom.js';
import { activeTheme } from '../content/themes.js';

const CAR = `
<svg viewBox="0 0 340 150" role="img" aria-label="Машина сбоку: фары, двери и багажник откликаются на команды">
  <defs>
    <linearGradient id="pc-body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1d2b38"/><stop offset="1" stop-color="#0e1922"/>
    </linearGradient>
  </defs>
  <g class="pc-shadow"><ellipse cx="170" cy="128" rx="140" ry="9"/></g>

  <g class="pc-body">
    <path d="M28 104 L34 78 Q40 62 62 60 L112 56 Q130 34 168 33 Q208 32 228 55 L286 63 Q308 68 312 84 L314 104 Z" fill="url(#pc-body)"/>
    <path d="M118 56 Q134 40 166 39 L168 57 Z" class="pc-glass"/>
    <path d="M176 39 Q206 40 222 57 L176 57 Z" class="pc-glass"/>
  </g>

  <!-- Багажник: крышка поворачивается вокруг своей петли -->
  <g class="pc-trunk">
    <path d="M228 55 L286 63 Q308 68 312 84 L300 84 Q294 72 280 70 L228 62 Z"/>
  </g>

  <!-- Двери: обе распахиваются наружу от стойки -->
  <g class="pc-door pc-door-front"><path d="M112 58 L168 58 L168 100 L112 100 Z"/><circle cx="160" cy="79" r="2.4"/></g>
  <g class="pc-door pc-door-rear"><path d="M172 58 L226 58 L226 100 L172 100 Z"/><circle cx="180" cy="79" r="2.4"/></g>

  <g class="pc-lamp pc-lamp-front"><ellipse cx="30" cy="88" rx="9" ry="6"/></g>
  <g class="pc-lamp pc-lamp-rear"><ellipse cx="311" cy="88" rx="7" ry="5"/></g>
  <g class="pc-beam"><path d="M22 88 L-70 62 L-70 116 Z"/></g>

  <g class="pc-wheel"><circle cx="92" cy="106" r="21"/><circle cx="92" cy="106" r="9" class="pc-hub"/></g>
  <g class="pc-wheel"><circle cx="256" cy="106" r="21"/><circle cx="256" cy="106" r="9" class="pc-hub"/></g>
</svg>`;

/* Одна команда — одно действие. Синонимы не роскошь: человек напишет то, что
   пришло в голову, и «не понял команду» на первом же экране читается как
   «сайт сломан». */
const COMMANDS = [
  { test: /^(ping|пинг)(\s+car|\s+машин\w*)?$/i, run: (car) => { blink(car); return 'PONG · блок отвечает, 14 мс'; } },
  { test: /^(lights?|фары)(\s+(on|вкл\w*))?$/i, run: (car) => { car.classList.add('lights'); return 'фары включены'; } },
  { test: /^(lights?|фары)\s+(off|выкл\w*)$/i, run: (car) => { car.classList.remove('lights'); return 'фары выключены'; } },
  { test: /^(doors?|unlock|двери|открой двери)(\s+\w+)?$/i, run: (car) => { car.classList.toggle('doors'); return car.classList.contains('doors') ? 'двери открыты' : 'двери закрыты'; } },
  { test: /^(trunk|boot|багажник)(\s+\w+)?$/i, run: (car) => { car.classList.toggle('trunk'); return car.classList.contains('trunk') ? 'багажник открыт' : 'багажник закрыт'; } },
  { test: /^(help|\?|помощь|команды)$/i, run: () => 'ping car · фары · двери · багажник' },
];

function blink(car) {
  car.classList.add('lights');
  setTimeout(() => car.classList.remove('lights'), 260);
  setTimeout(() => car.classList.add('lights'), 460);
  setTimeout(() => car.classList.remove('lights'), 720);
}

/**
 * Возвращает виджет или null, если у истории нет машины. Молча ничего не
 * ломает: экран собран так, что null просто не добавляется.
 */
export function carConsole() {
  if (activeTheme().id !== 'garage') return null;

  const stage = el('div', { class: 'pc-stage' });
  stage.innerHTML = CAR;
  const car = stage.querySelector('svg');

  const log = el('div', { class: 'pc-log' }, [
    el('p', { text: '> шина слушает. напиши ping car' }),
  ]);

  const say = (text, ok) => {
    const line = el('p', { class: ok ? 'ok' : 'bad', text: `> ${text}` });
    log.append(line);
    while (log.children.length > 4) log.firstChild.remove();
  };

  const input = el('input', {
    type: 'text', class: 'pc-input', placeholder: 'ping car',
    autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
    'aria-label': 'Команда машине',
  });

  const send = () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    const hit = COMMANDS.find((item) => item.test.test(text));
    say(hit ? hit.run(car) : `«${text}» блок не понял. Попробуй ping car`, Boolean(hit));
  };

  input.addEventListener('keydown', (event) => { if (event.key === 'Enter') send(); });

  return el('div', { class: 'pc-wrap panel' }, [
    el('div', { class: 'pc-head' }, [
      el('span', { text: 'ШИНА · ЖИВОЙ ОТКЛИК' }),
      el('small', { text: 'настоящая, не видео' }),
    ]),
    stage,
    log,
    el('div', { class: 'pc-row' }, [
      input,
      el('button', { type: 'button', class: 'pc-send', onclick: send }, 'Отправить'),
    ]),
    el('div', { class: 'pc-hints' }, ['ping car', 'фары', 'двери', 'багажник'].map(
      (cmd) => el('button', {
        type: 'button', class: 'pc-hint',
        onclick: () => { input.value = cmd; send(); input.focus(); },
      }, cmd),
    )),
  ]);
}
