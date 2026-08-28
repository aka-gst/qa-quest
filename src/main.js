/*
 * Сборка приложения: шапка, маршруты, режимы подачи и вход.
 */

import { lessonById, loadPracticums } from './content/index.js';
import {
  loadStore, subscribe, store, setMode, levelInfo, resetProgress, isLessonOpen,
} from './store.js';
import { bootRunner, onRunnerChange } from './runner.js';
import { auth, onAuthChange, probeAuth, login, register, logout, progressHint } from './auth.js';
import { renderMap } from './ui/map.js';
import { renderLesson } from './ui/lesson.js';
import { el, clear, $ } from './ui/dom.js';

const screens = {
  map: $('mapScreen'),
  lesson: $('lessonScreen'),
};

/**
 * Откуда брать Pyodide. Если рядом с сайтом выложена локальная копия
 * (tools/fetch-pyodide.sh), берём её: это быстрее и не зависит от чужого CDN.
 * Иначе воркер сам сходит на jsDelivr.
 */
const runnerConfig = (async () => {
  if (window.QA_QUEST_PYODIDE) return { base: window.QA_QUEST_PYODIDE };
  try {
    const response = await fetch('vendor/pyodide/pyodide.mjs', { method: 'HEAD' });
    if (response.ok) return { base: new URL('vendor/pyodide/', location.href).href };
  } catch (_) { /* локальной копии нет — это норма */ }
  return {};
})();

/* ---------- маршруты ---------- */

function openLesson(lesson) {
  location.hash = `#/lesson/${lesson.id}`;
}

function openMap() {
  location.hash = '#/';
}

function route() {
  const match = location.hash.match(/^#\/lesson\/([\w-]+)$/);
  const lesson = match ? lessonById(match[1]) : null;
  // Прямая ссылка не должна обходить порядок уроков: закрытый урок
  // возвращает на карту, где видно, что именно его открывает.
  if (lesson && !isLessonOpen(lesson)) {
    toast('Этот урок пока закрыт — сначала предыдущий');
    location.replace('#/');
    return;
  }
  if (lesson) {
    screens.map.hidden = true;
    screens.lesson.hidden = false;
    // Практикуму Python не нужен: там работа идёт на своей машине.
    if (lesson.kind !== 'lab') runnerConfig.then(bootRunner);
    renderLesson(screens.lesson, lesson, {
      onBack: openMap,
      onOpen: openLesson,
      onProgress: celebrate,
    });
  } else {
    screens.lesson.hidden = true;
    screens.map.hidden = false;
    renderMap(screens.map, { onOpen: openLesson });
  }
}

/* ---------- шапка ---------- */

function renderHeader() {
  const { level, into, need } = levelInfo();
  $('profileLevel').textContent = level;
  $('xpLabel').textContent = `${into} / ${need} XP`;
  $('xpBar').style.width = `${Math.round((into / need) * 100)}%`;

  const streak = store.state.streak;
  const streakChip = $('streakChip');
  streakChip.textContent = streak.current > 0 ? `🔥 ${streak.current}` : '🔥 0';
  streakChip.title = streak.current > 0
    ? `Серия: ${streak.current} дн. подряд, рекорд ${streak.best}`
    : 'Реши задачу сегодня, чтобы начать серию';

  document.querySelectorAll('.mode-switch button').forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === store.state.mode);
    button.setAttribute('aria-pressed', String(button.dataset.mode === store.state.mode));
  });
}

/* ---------- события прогресса ---------- */

let toastTimer = null;
function toast(message, tone = '') {
  const node = $('toast');
  node.textContent = message;
  node.className = `toast show ${tone}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { node.className = 'toast'; }, 2600);
}

function celebrate(outcome, lesson, task) {
  const parts = [`Задача решена · +${outcome.xp} XP`];
  if (outcome.streakGrew && store.state.streak.current > 1) parts.push(`серия ${store.state.streak.current} дн.`);
  if (outcome.leveledUp) parts.push(`уровень ${levelInfo().level}`);
  if (outcome.tierUnlocked) parts.push('открыта новая ступень');
  toast(parts.join(' · '), 'ok');
  route();
}

/* ---------- вход ---------- */

function renderAccount() {
  const button = $('accountButton');
  button.textContent = auth.status === 'signed' ? auth.email.split('@')[0] : 'Войти';
  button.classList.toggle('signed', auth.status === 'signed');
  $('progressHint').textContent = progressHint();
}

function accountDialog() {
  const dialog = $('accountDialog');
  const body = clear($('accountBody'));

  if (auth.status === 'signed') {
    body.append(
      el('p', { text: `Вы вошли как ${auth.email}. Прогресс синхронизируется между устройствами.` }),
      el('button', {
        class: 'run-button',
        onclick: async () => { await logout(); accountDialog(); },
      }, 'Выйти'),
    );
    dialog.showModal();
    return;
  }

  if (auth.status === 'offline') {
    body.append(
      el('p', { text: 'Общий вход aka-gst сейчас недоступен: сервис аккаунтов не отвечает.' }),
      el('p', { class: 'dialog-note', text: 'Прогресс сохраняется в этом браузере и подтянется в аккаунт, когда вход появится.' }),
    );
    dialog.showModal();
    return;
  }

  const email = el('input', { type: 'email', placeholder: 'почта', autocomplete: 'email' });
  const password = el('input', { type: 'password', placeholder: 'пароль', autocomplete: 'current-password' });
  const error = el('p', { class: 'dialog-error' });

  const submit = async (action) => {
    error.textContent = '';
    const result = await action(email.value.trim(), password.value);
    if (!result.ok) {
      error.textContent = result.error;
      return;
    }
    if (result.verificationRequired) {
      error.textContent = 'Аккаунт создан. Подтвердите почту по ссылке из письма и войдите.';
      return;
    }
    $('accountDialog').close();
    renderAccount();
    route();
  };

  body.append(
    el('p', { text: 'Одна учётная запись на все проекты aka-gst: и на Лилу, и сюда, и на рекорды в играх.' }),
    email,
    password,
    error,
    el('div', { class: 'dialog-actions' }, [
      el('button', { class: 'run-button', onclick: () => submit(login) }, 'Войти'),
      el('button', { class: 'ghost-button', onclick: () => submit(register) }, 'Создать аккаунт'),
    ]),
  );
  dialog.showModal();
}

/* ---------- старт ---------- */

loadStore();
subscribe(renderHeader);

document.querySelectorAll('.mode-switch button').forEach((button) => {
  button.addEventListener('click', () => {
    setMode(button.dataset.mode);
    route();
  });
});

$('accountButton').addEventListener('click', accountDialog);
$('closeDialog').addEventListener('click', () => $('accountDialog').close());
$('resetProgress').addEventListener('click', () => {
  if (confirm('Сбросить весь прогресс, XP и сохранённый код?')) {
    resetProgress();
    openMap();
    route();
  }
});

onRunnerChange((state) => {
  const chip = $('pythonChip');
  chip.dataset.status = state.status;
  chip.textContent = {
    idle: 'Python: не загружен',
    loading: state.message || 'Python: загружается',
    ready: `Python ${state.version || ''}`.trim(),
    failed: 'Python недоступен',
  }[state.status];
});

onAuthChange(renderAccount);
window.addEventListener('hashchange', route);
route();

// Практикумы ступеней 2 и 3 подтягиваются из course.json. Если их нет рядом,
// ступени остаются с одним тренажёром — страница от этого не ломается.
loadPracticums().then(({ imported }) => {
  if (imported) route();
});

// Вход подтянет серверный прогресс, и карту придётся перерисовать.
probeAuth().then((state) => {
  if (state.status === 'signed') route();
});
