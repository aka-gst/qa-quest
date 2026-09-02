import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('every lesson always requires every task, including a saved short-mode visitor', async () => {
  const { requiredTasks } = await import('../src/store.js');
  const lesson = { tasks: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] };

  assert.deepEqual(requiredTasks(lesson, 'sprint'), lesson.tasks);
  assert.deepEqual(requiredTasks(lesson, 'deep'), lesson.tasks);
});

test('the first screen has no course-length chooser or top mode switch', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

  assert.doesNotMatch(html, /modeDialog/);
  assert.doesNotMatch(html, /mode-switch/);
  assert.doesNotMatch(html, /Коротко/);
});
