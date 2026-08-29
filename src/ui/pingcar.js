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

export const CAR = `
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

  <!-- Поворотник: моргает по одному разу на каждую напечатанную строку -->
  <g class="pc-signal"><circle cx="62" cy="92" r="4.5"/></g>

  <!-- Проекция на лобовое: сюда выводится то, что напечатала программа -->
  <g class="pc-hud">
    <path d="M150 33 L150 24" class="pc-hud-ray"/>
    <rect x="24" y="4" width="292" height="19" rx="5"/>
    <text x="34" y="17">—</text>
  </g>
</svg>`;

/*
 * Разбор команды. Принимаем и человеческое слово, и настоящий питоновский
 * вызов — тот самый, который человек напишет в финале ночи:
 *   send({"cmd": "enable", "what": "lights"})
 * Кнопки-подсказки подставляют именно вызов, а не слово: пусть первое, что
 * человек увидит в терминале, будет кодом, а не игрой в слова.
 */
export const SNIPPETS = {
  ping: 'send({"cmd": "ping"})',
  lights: 'send({"cmd": "enable", "what": "lights"})',
  doors: 'send({"cmd": "unlock", "what": "doors"})',
  trunk: 'send({"cmd": "open", "what": "trunk"})',
};

const TARGET = [
  ['ping', /\bping\b|\bпинг\b/i],
  ['lights', /\blights?\b|\bфар/i],
  ['doors', /\bdoors?\b|\bunlock\b|\block\b|\bдвер/i],
  ['trunk', /\btrunk\b|\bboot\b|\bбагажник/i],
];
const OFF = /\boff\b|\bdisable\b|\bclose\b|\block\b|\bвыкл|\bзакр/i;

function parse(text, car) {
  const found = TARGET.find(([, re]) => re.test(text));
  if (!found) return null;
  const [what] = found;
  if (what === 'ping') {
    blink(car);
    return 'PONG · блок отвечает, 14 мс';
  }
  const off = OFF.test(text);
  car.classList.toggle(what, !off);
  const words = {
    lights: ['фары включены', 'фары выключены'],
    doors: ['двери открыты', 'двери закрыты'],
    trunk: ['багажник открыт', 'багажник закрыт'],
  }[what];
  return off ? words[1] : words[0];
}

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
    const answer = parse(text, car);
    say(answer || `блок не понял. Попробуй ${SNIPPETS.ping}`, Boolean(answer));
  };

  input.addEventListener('keydown', (event) => { if (event.key === 'Enter') send(); });

  const wrap = el('div', { class: 'pc-wrap panel' }, [
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
    el('div', { class: 'pc-hints' }, [
      ['пинг', SNIPPETS.ping],
      ['фары', SNIPPETS.lights],
      ['двери', SNIPPETS.doors],
      ['багажник', SNIPPETS.trunk],
    ].map(([label, code]) => el('button', {
      type: 'button', class: 'pc-hint', title: code,
      onclick: () => { stopIdle(); input.value = code; send(); input.focus(); },
    }, label))),
  ]);

  /*
   * Пока человек ничего не трогает, шина живёт сама: раз в несколько секунд в
   * строку набирается команда и машина откликается. Иначе первый экран стоит
   * мёртвым, и большинство просто не догадается, что здесь можно что-то
   * набрать. Как только человек тронул поле — самовольство прекращается: он
   * пришёл сам, мешать ему нечего.
   */
  const DEMO = [SNIPPETS.lights, SNIPPETS.doors, SNIPPETS.ping, SNIPPETS.trunk];
  let demoStep = 0;
  let idleTimer = null;
  let typing = null;

  function stopIdle() {
    clearTimeout(idleTimer);
    clearInterval(typing);
    idleTimer = null;
    typing = null;
    input.classList.remove('auto');
  }

  function typeOut(code, done) {
    input.classList.add('auto');
    input.value = '';
    let i = 0;
    typing = setInterval(() => {
      input.value = code.slice(0, i += 2);
      if (i < code.length) return;
      clearInterval(typing);
      typing = null;
      setTimeout(() => { input.classList.remove('auto'); done(); }, 320);
    }, 26);
  }

  function idleTick() {
    if (document.hidden || !wrap.isConnected) {
      idleTimer = setTimeout(idleTick, 4000);
      return;
    }
    typeOut(DEMO[demoStep++ % DEMO.length], () => {
      send();
      idleTimer = setTimeout(idleTick, 5200);
    });
  }

  ['focus', 'keydown', 'pointerdown'].forEach((event) => input.addEventListener(event, stopIdle));
  idleTimer = setTimeout(idleTick, 2600);

  return wrap;
}
