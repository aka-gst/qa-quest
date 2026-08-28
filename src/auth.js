/*
 * Клиент общего аккаунта aka-gst.
 *
 * Вход у сайта один и живёт на уровне сайта (Zakriva/ops/accounts), а не
 * внутри проекта: кука aka_auth выставлена с Path=/ и обслуживает и Лилу,
 * и QA Quest. Пока сервис недоступен, страница продолжает работать без входа
 * и хранит прогресс в браузере — ни один урок от этого не ломается.
 */

import { store, mergeState, attachRemote } from './store.js';

const API = (window.QA_QUEST_API || '').replace(/\/$/, '');
const PROGRESS_SCOPE = 'qa-quest';

export const auth = {
  status: 'unknown',   // unknown | offline | guest | signed
  email: null,
  verified: false,
};

const listeners = new Set();

export function onAuthChange(callback) {
  listeners.add(callback);
  callback(auth);
  return () => listeners.delete(callback);
}

function emit(patch) {
  Object.assign(auth, patch);
  listeners.forEach((callback) => callback(auth));
}

async function api(path, options = {}) {
  const response = await fetch(`${API}/api${path}`, {
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  });
  let payload = {};
  try {
    payload = await response.json();
  } catch (_) { /* сервер ответил не-JSON */ }
  return { ok: response.ok, status: response.status, payload };
}

/** Один запрос решает, показывать ли вход вообще. */
export async function probeAuth() {
  try {
    const { ok, payload } = await api('/auth/me');
    if (!ok) throw new Error('нет сервиса аккаунтов');
    if (payload.authenticated) {
      emit({ status: 'signed', email: payload.email, verified: Boolean(payload.email_verified) });
      await pullProgress();
    } else {
      emit({ status: 'guest', email: null, verified: false });
    }
  } catch (_) {
    emit({ status: 'offline', email: null, verified: false });
  }
  return auth;
}

export async function login(email, password) {
  const { ok, status, payload } = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!ok) {
    return { ok: false, error: status === 403 ? 'Почта ещё не подтверждена.' : 'Неверная почта или пароль.' };
  }
  emit({ status: 'signed', email: payload.email, verified: true });
  await pullProgress();
  return { ok: true };
}

export async function register(email, password) {
  if (String(password).length < 12) {
    return { ok: false, error: 'Пароль должен быть не короче 12 символов.' };
  }
  const { ok, status, payload } = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!ok) {
    return { ok: false, error: status === 409 ? 'Такая почта уже занята.' : 'Не получилось создать аккаунт.' };
  }
  return { ok: true, verificationRequired: Boolean(payload.verification_required) };
}

export async function verify(token) {
  const { ok } = await api('/auth/verify', { method: 'POST', body: JSON.stringify({ token }) });
  if (!ok) return { ok: false, error: 'Ссылка подтверждения не подошла.' };
  await probeAuth();
  return { ok: true };
}

export async function logout() {
  await api('/auth/logout', { method: 'POST' });
  emit({ status: 'guest', email: null, verified: false });
}

/* ---------- прогресс на сервере ---------- */

/**
 * Эндпоинт общего сервиса аккаунтов, см. docs/shared-account.md.
 * До его появления pull/push тихо ничего не делают.
 */
async function pullProgress() {
  const { ok, payload } = await api(`/progress/${PROGRESS_SCOPE}`);
  if (ok && payload && payload.state) mergeState(payload.state);
}

let pushTimer = null;
function pushProgress(state) {
  if (auth.status !== 'signed') return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    api(`/progress/${PROGRESS_SCOPE}`, {
      method: 'PUT',
      body: JSON.stringify({ state, updatedAt: state.updatedAt }),
    }).catch(() => { /* сеть пропала — прогресс уже лежит в localStorage */ });
  }, 1500);
}

attachRemote({ push: pushProgress });

export function progressHint() {
  if (auth.status === 'signed') return `Прогресс сохраняется в аккаунте ${auth.email}`;
  if (auth.status === 'guest') return 'Войди, чтобы прогресс не терялся при смене устройства';
  return 'Прогресс сохраняется в этом браузере';
}

export { store };
