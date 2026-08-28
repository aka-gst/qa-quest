/*
 * Выгружает задачи тренажёра в JSON для офлайн-проверки эталонных решений.
 * Практикум сюда не попадает: он подтягивается из course.json в браузере,
 * выполняется на своей машине и проверяется чек-листом, а не кодом.
 */
import { lessons, TIERS } from '../src/content/index.js';

const payload = {
  tiers: TIERS.map((tier) => tier.id),
  tasks: lessons.filter((lesson) => lesson.kind !== 'lab').flatMap((lesson) =>
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
