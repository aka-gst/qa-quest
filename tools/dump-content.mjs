/*
 * Выгружает задачи тренажёра в JSON для офлайн-проверки эталонных решений.
 * Практикум сюда не попадает: он подтягивается из course.json в браузере,
 * выполняется на своей машине и проверяется чек-листом, а не кодом.
 *
 * Берутся ВСЕ истории первой ступени, а не только выбранная. Каталог выбирает
 * историю по localStorage, а в Node его нет — значит через каталог проверялась
 * бы вечно одна и та же, и задачи второй истории уезжали бы на сайт вообще без
 * проверки. Такое здесь уже случалось с контрольными суммами: проверка была
 * зелёной ровно потому, что смотрела не туда.
 */
import { TIERS } from '../src/content/index.js';
import { THEMES } from '../src/content/themes.js';
import { testingLessons } from '../src/content/testing.js';
import { llmLessons } from '../src/content/llm.js';

const seen = new Set();
const all = [];
for (const lesson of [...THEMES.flatMap((theme) => theme.lessons), ...testingLessons, ...llmLessons]) {
  if (seen.has(lesson.id)) continue;
  seen.add(lesson.id);
  all.push(lesson);
}

const payload = {
  tiers: TIERS.map((tier) => tier.id),
  themes: THEMES.map((theme) => ({ id: theme.id, lessons: theme.lessons.length })),
  tasks: all.filter((lesson) => lesson.kind !== 'lab').flatMap((lesson) =>
    lesson.tasks.filter((task) => task.kind !== 'checklist').map((task) => ({
      lesson: lesson.id,
      tier: lesson.tier,
      task: task.id,
      preamble: lesson.preamble || '',
      starter: task.starter || '',
      solution: task.solution || '',
      stdin: task.stdin || [],
      checks: task.checks || [],
      xp: task.xp,
    })),
  ),
};
process.stdout.write(JSON.stringify(payload));
