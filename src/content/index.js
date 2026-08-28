/*
 * Каталог курса: три ступени, сквозной порядок уроков, поиск по идентификатору.
 */

import { pythonLessons } from './python.js';
import { testingLessons } from './testing.js';
import { llmLessons } from './llm.js';

export const TIERS = [
  {
    id: 'python',
    number: 1,
    title: 'Питон с нуля',
    tagline: 'Ничего знать заранее не нужно',
    about: 'Пятнадцать уроков от первой команды до законченной программы. Код запускается прямо здесь, устанавливать ничего не надо.',
    accent: 'cyan',
  },
  {
    id: 'testing',
    number: 2,
    title: 'Тестирование',
    tagline: 'Проверять чужой код и доказывать результат',
    about: 'От первого assert до автотестов API, границ и отчётов. В основе — практикум по проверке реального шлюза.',
    accent: 'mint',
  },
  {
    id: 'llm',
    number: 3,
    title: 'Работа и тесты с LLM',
    tagline: 'То, за что платят сейчас',
    about: 'Модель как API, структурированный вывод, агент с инструментами, оценка качества и защита от prompt-инъекций.',
    accent: 'violet',
  },
];

export const lessons = [...pythonLessons, ...testingLessons, ...llmLessons];

const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));

export function lessonById(id) {
  return byId.get(id) || null;
}

export function tierById(id) {
  return TIERS.find((tier) => tier.id === id) || null;
}

export function lessonsOfTier(tierId) {
  return lessons.filter((lesson) => lesson.tier === tierId);
}

export function findTask(lessonId, taskId) {
  const lesson = lessonById(lessonId);
  if (!lesson) return null;
  const task = lesson.tasks.find((item) => item.id === taskId);
  return task ? { lesson, task } : null;
}
