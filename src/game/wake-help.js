function genericReason(result) {
  const failedCheck = result.checks?.find((check) => !check.ok)?.detail;
  const error = result.error;
  if (!error) return failedCheck || 'Команда выполнилась, но машина не проснулась.';
  return `${error.type}${error.line ? ` · строка ${error.line}` : ''}: ${error.text}${error.hint ? ` — ${error.hint}` : ''}`;
}

export function getWakeFailureGuidance(attempt, result, source) {
  if (attempt >= 3) {
    return {
      message: 'Кто-то начал команду за тебя. Допиши слово с плаката, закрой кавычки и скобку.',
      prefill: 'print("',
    };
  }
  if (attempt === 2) {
    return {
      message: 'Ответ был рядом: посмотри на упавший плакат у старой руки.',
      prefill: null,
    };
  }
  if (result.error?.type === 'NameError' && /print\(\s*WAKE\s*\)/.test(source)) {
    return {
      message: 'WAKE — это текст, поэтому ему нужны кавычки.',
      prefill: null,
    };
  }
  return { message: genericReason(result), prefill: null };
}
