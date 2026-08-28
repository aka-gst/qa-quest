"""Прогоняет эталонное решение каждой задачи через тот же движок, что и браузер.

Проверяется два условия:
  1. эталон проходит все проверки задачи;
  2. заготовка (starter) их НЕ проходит — иначе задача решается сама собой.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load_harness():
    js = (ROOT / 'src' / 'pyworker.js').read_text(encoding='utf8')
    match = re.search(r"const HARNESS = String\.raw`(.*?)`;\n", js, re.S)
    scope = {}
    exec(compile(match.group(1), 'harness.py', 'exec'), scope)
    return scope['_quest_run']


def main():
    run = load_harness()
    payload = json.loads(subprocess.run(
        ['node', str(ROOT / 'tools' / 'dump-content.mjs')],
        capture_output=True, text=True, check=True).stdout)

    problems = []
    trivial = []
    for task in payload['tasks']:
        name = f"{task['lesson']}:{task['task']}"
        if not task['solution']:
            problems.append((name, 'нет эталонного решения'))
            continue

        result = json.loads(run(json.dumps({
            'source': task['solution'],
            'preamble': task['preamble'],
            'checks': task['checks'],
            'stdin': task['stdin'],
            'timeLimit': 10,
        })))
        if result['error']:
            problems.append((name, f"эталон падает: {result['error']['text'].splitlines()[0]}"))
            continue
        for spec, outcome in zip(task['checks'], result['checks']):
            if not outcome['ok']:
                problems.append((name, f"проверка не проходит: {spec['label']} — {outcome['detail']}"))

        starter = json.loads(run(json.dumps({
            'source': task['starter'],
            'preamble': task['preamble'],
            'checks': task['checks'],
            'stdin': task['stdin'],
            'timeLimit': 10,
        })))
        if not starter['error'] and all(item['ok'] for item in starter['checks']):
            trivial.append(name)

    for name, message in problems:
        print(f'ОШИБКА  {name}: {message}')
    for name in trivial:
        print(f'ПУСТАЯ  {name}: заготовка уже проходит все проверки')

    total = len(payload['tasks'])
    print(f'\nзадач: {total}, с ошибками: {len({p[0] for p in problems})}, тривиальных: {len(trivial)}')
    return 1 if problems or trivial else 0


if __name__ == '__main__':
    sys.exit(main())
