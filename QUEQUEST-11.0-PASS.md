# QueQuest 11.0 — release pass

Дата: 2026-09-19.

## Что изменено относительно 10.0

- добавлен `RELEASE WEEK` как слой жизни кода после deploy;
- пять связанных authored-дней: schema evolution, load growth, stale knowledge,
  tool authority и combined release night;
- Q-Bot теперь может приносить как хороший, так и опасно убедительный patch;
- claim Q-Bot не является evidence: тестовый стенд, canary и observation живут
  отдельными шагами;
- зелёный test не считается production deploy;
- risky patch требует ограниченного canary и наблюдения до полного выпуска;
- плохой direct deploy материализует blast radius, а не просто красный текст;
- regression, пойманная на тесте или canary, может быть безопасно откатана;
- rollback считается сохранённой управляемостью, но не завершает саму миграцию;
- после 5/5 открываются deterministic `RELEASE RUN #seed`;
- mastery заканчивается настоящим Python `decide_release(patch, evidence)` с
  поведенческими CPython-проверками;
- campus profile обновлён до v10 и merge-safe хранит releases, rollbacks, release
  runs и code guard;
- ранг расширен до `RELEASE ARCHITECT`;
- brand/cache-bust обновлены до 11.0.

## Автоматическая проверка рабочей копии

- `node --test tools/*.test.mjs`: **323 / 323 PASS**;
- `sh tools/selftest.sh`: **PASS**, negative-controls действительно падают;
- `python3 tools/verify_content.py`: **154 задачи, 0 ошибок, 0 тривиальных**;
- JS syntax: **73 / 73 PASS**;
- основной DOM: **631 ID / 631 unique / 0 duplicates**;
- replay DOM: **9 / 9 unique / 0 duplicates**;
- прямые JS selectors: **568 uses / 398 unique / 0 missing**.

## Что особенно защищено тестами 11.0

- test evidence не может случайно засчитаться как deploy;
- reckless Q-Bot patch создаёт больший blast radius, чем пойманная на стенде
  regression;
- заметный риск нельзя полностью выпустить без canary + observation;
- deterministic release-run seed воспроизводим;
- release progress merge-safe и один seed не фармит XP повторно;
- reference `decide_release()` проходит настоящий системный CPython;
- HTML остаётся внутри старых safety-contracts ранних synthetic-defense сцен.

## Human-playtest boundary

Автоматика не доказывает:

- что игрок эмоционально начинает защищать знакомые городские сервисы;
- что canary понятен до технического термина;
- что плохой Q-Bot patch ощущается как осмысленный риск, а не ловушка;
- что rollback воспринимается как контроль, а не наказание;
- что пять связанных дней ощущаются одной историей эксплуатации, а не пятью
  одинаковыми панелями.

Эти пункты остаются обязательной проверкой живым playtest-ом.

## Release archive

Финальный ZIP должен быть распакован в отдельный чистый каталог и повторно пройти
полный Node regression, selftest, content verifier, JS syntax и DOM/selectors.
Результат ZIP-smoke дописывается ниже после проверки.

## Проверка распакованного ZIP

Архив был распакован в отдельный чистый каталог. Проверки повторены уже из
переносимого релизного дерева:

- full Node regression: **323 / 323 PASS**;
- negative-control selftest: **PASS**;
- content verifier: **154 / 0 / 0**;
- JS syntax: **73 / 73 PASS**;
- основной DOM: **631 / 631 unique, 0 duplicates**;
- replay DOM: **9 / 9 unique, 0 duplicates**;
- direct selectors: **568 uses / 398 unique / 0 missing**.

Это проверка ZIP, а не только development-каталога.
