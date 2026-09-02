import assert from 'node:assert/strict';
import test from 'node:test';

async function loadModule(path, label) {
  try {
    return await import(path);
  } catch (error) {
    assert.fail(`${label} is missing: ${error.code || error.message}`);
  }
}

test('explains an unquoted required text on the first syntax error', async () => {
  const { errorGuidance } = await loadModule('../src/ui/error-guidance.js', 'error guidance');

  assert.deepEqual(errorGuidance({
    error: { type: 'SyntaxError', text: 'invalid syntax' },
    source: 'print(ECU online)',
    expectedText: 'ECU online',
  }), {
    code: 'quote-required-text',
    text: '«ECU online» — это текст. Возьми его в кавычки: print("ECU online").',
  });
});

test('does not pretend every syntax error is a missing quote', async () => {
  const { errorGuidance } = await loadModule('../src/ui/error-guidance.js', 'error guidance');

  assert.equal(errorGuidance({
    error: { type: 'SyntaxError', text: 'invalid syntax' },
    source: 'print(2 + )',
    expectedText: 'ECU online',
  }), null);
});

test('live incident card is local, safe, and changes its lead for a real run outcome', async () => {
  const { incidentForRun } = await loadModule('../src/ui/incident-feed.js', 'incident feed');

  const errorCard = incidentForRun({ themeId: 'garage', outcome: 'error' });
  const successCard = incidentForRun({ themeId: 'garage', outcome: 'success' });

  assert.deepEqual(errorCard, {
    id: 'uconnect-2015',
    eyebrow: 'РЕАЛЬНЫЙ КЕЙС · 2015',
    title: 'Jeep Cherokee: отзыв 1,4 млн машин',
    lead: 'Ошибка в коде останавливает программу. В машине она может остановить целую сеть.',
    fact: 'После публично раскрытой уязвимости Uconnect FCA и NHTSA запустили отзыв и обновление ПО для примерно 1,4 млн автомобилей.',
    defense: 'Вывод: обновления безопасности — часть обслуживания машины, а не лишняя галочка.',
    sourceLabel: 'CISA: FCA Uconnect Vulnerability',
    sourceUrl: 'https://www.cisa.gov/news-events/alerts/2015/07/27/fiat-chrysler-automobiles-fca-uconnect-vulnerability',
  });
  assert.equal(successCard.id, errorCard.id);
  assert.equal(successCard.lead, 'Твой код дал ответ. В 2015-м один ответ от системы автомобиля привёл к отзыву миллионов машин.');
  assert.doesNotMatch(`${successCard.fact} ${successCard.defense}`, /как (взломать|угнать)|инструкц/i);
});
