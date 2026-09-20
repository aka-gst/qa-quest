import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  FRIEND_DEFENSE_SOURCE,
  FRIEND_ROLES,
  FRIEND_ROUNDS,
  resolveFriendDefense,
} from '../src/game/friend-sandbox.js';
import { applyGameAction, createCheckpointState } from '../src/game/model.js';
import { CHECKPOINTS } from '../src/game/config.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

 test('friends defense is one isolated six-event match with three temporary AI roles', () => {
  assert.equal(FRIEND_ROLES.length, 3);
  assert.equal(FRIEND_ROUNDS.length, 6);
  assert.deepEqual(FRIEND_ROLES.map(({ id }) => id), ['observe', 'filter', 'restore']);
  assert.match(html, /ИЗОЛИРОВАННЫЙ ТРЕНИРОВОЧНЫЙ КОНТУР/);
  assert.match(html, /три временные AI-роли/i);
  assert.doesNotMatch(html, /парол|логин|токен|ip-адрес|ssh|порт\s*\d+/i);
});

test('every training event has exactly one stable matching role and wrong choices retry immediately', () => {
  for (const [index, round] of FRIEND_ROUNDS.entries()) {
    const correct = resolveFriendDefense(index, round.role);
    assert.equal(correct.ok, true);
    assert.equal(correct.nextRound, index + 1);

    const wrongRole = FRIEND_ROLES.find(({ id }) => id !== round.role).id;
    const wrong = resolveFriendDefense(index, wrongRole);
    assert.equal(wrong.ok, false);
    assert.equal(wrong.nextRound, index);
  }
  assert.equal(resolveFriendDefense(FRIEND_ROUNDS.length - 1, FRIEND_ROUNDS.at(-1).role).done, true);
});

test('programming form is revealed from already learned for/def/if concepts after the match', () => {
  assert.match(FRIEND_DEFENSE_SOURCE, /^def defend\(event\):/m);
  assert.match(FRIEND_DEFENSE_SOURCE, /^\s+if event\.kind == "unknown":/m);
  assert.match(FRIEND_DEFENSE_SOURCE, /^for event in incoming:/m);
  assert.match(FRIEND_DEFENSE_SOURCE, /defend\(event\)/);
  assert.match(html, /Ты уже сделал это руками\. Вот та же защита как программа/);
});

test('friends defense checkpoints resume and finish without inventing a backend', () => {
  assert.ok(CHECKPOINTS.includes('friends'));
  assert.ok(CHECKPOINTS.includes('reward5'));
  const reward4 = createCheckpointState('reward4');
  const started = applyGameAction(reward4, { type: 'start-friends-defense' });
  assert.equal(started.checkpoint, 'friends');
  assert.equal(started.learning.chapter, 5);
  const finished = applyGameAction(started, { type: 'friends-defense-complete' });
  assert.equal(finished.checkpoint, 'reward5');
  assert.equal(createCheckpointState('friends').checkpoint, 'friends');
  assert.equal(createCheckpointState('reward5').checkpoint, 'reward5');
});
