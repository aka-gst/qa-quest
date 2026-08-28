/* Выгружает каталог уроков в JSON для офлайн-проверки эталонных решений. */
import { lessons, TIERS } from '../src/content/index.js';

const payload = {
  tiers: TIERS.map((tier) => tier.id),
  tasks: lessons.flatMap((lesson) =>
    lesson.tasks.map((task) => ({
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
