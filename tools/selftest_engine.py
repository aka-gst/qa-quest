"""Негативный контроль движка проверок: он обязан уметь сказать «не сошлось».

Проверка, которая всегда зелёная, бесполезна, а на глаз это не видно. Здесь
одному и тому же заданию скармливается верное решение и заведомо неверное;
тест проходит, только если движок различил их.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def harness():
    js = (ROOT / 'src' / 'pyworker.js').read_text(encoding='utf8')
    source = re.search(r"const HARNESS = String\.raw`(.*?)`;\n", js, re.S).group(1)
    scope = {}
    exec(compile(source, 'harness.py', 'exec'), scope)
    return scope['_quest_run']


def run(engine, code, checks):
    return json.loads(engine(json.dumps({
        'source': code, 'preamble': '', 'checks': checks, 'stdin': [], 'timeLimit': 5,
    })))


def main():
    engine = harness()
    checks = [
        {'kind': 'stdout', 'mode': 'equals', 'value': 'Q-Bot online'},
        {'kind': 'var', 'name': 'agent_name', 'equals': 'Q-Bot'},
    ]

    good = run(engine, 'agent_name = "Q-Bot"\nprint(agent_name + " online")', checks)
    if good['error'] or not all(c['ok'] for c in good['checks']):
        print('движок не принял верное решение', file=sys.stderr)
        return 1

    bad = run(engine, 'agent_name = "кто-то другой"\nprint("привет")', checks)
    if any(c['ok'] for c in bad['checks']):
        print('движок принял неверное решение — проверки ничего не проверяют', file=sys.stderr)
        return 1

    broken = run(engine, 'print("не закрытая скобка"', checks)
    if not broken['error']:
        print('движок не заметил синтаксическую ошибку', file=sys.stderr)
        return 1

    return 0


if __name__ == '__main__':
    sys.exit(main())
