# Промты на графику для QA Quest

Две картинки, которые я не могу нарисовать кодом. Остальное из прежнего
задания уже сделано и выложено: иконка сайта, иконка для домашнего экрана и
фон карты — их гонять через генератор не нужно.

Промты на английском намеренно: генераторы понимают его надёжнее. Копировать
целиком, включая строку с запретами.

---

## 1. `finale.png` — экран победы

Показывается, когда человек прошёл последний шаг курса: построил защиту
своего сервера и сам её сломал. Единственный момент, которым хочется
похвастаться, — сейчас на этом месте пусто.

**Размер 1200 × 800, PNG или WebP, до 200 КБ. Центр кадра оставить спокойным:
поверх ляжет подпись.**

```
A dark cyberpunk night scene in a restrained 1980s terminal aesthetic.
A massive wall of translucent ice — a security barrier — has been cracked
open; fine fracture lines run through it, lit from within by pale cyan light.
Beyond the breach, the first cold light of dawn rises over a distant low
skyline. The foreground is dark and quiet, with the faint glow of a CRT
screen falling from below the frame.

Mood: quiet triumph after a long night of work. Stillness, not explosion.

Strict palette: near-black blue background #081018, cyan #67e8f9 as the main
light, mint green #72f1b8 and violet #a78bfa as small accents, muted grey-blue
#8ea2ae for distance. Flat, cinematic, restrained. Subtle film grain allowed.

Composition: the centre of the frame stays calm and uncluttered; visual
interest sits in the upper left and lower right.

Negative: no text, no letters, no numbers, no logos, no watermark, no people,
no faces, no glossy 3D render, no lens flare, no neon signage, no purple-pink
synthwave sunset, no grid horizon cliche, no clutter.
```

---

## 2. `og.png` — картинка для ссылки в мессенджерах

Это то, что видит человек, когда ему присылают ссылку на курс, и по чему
решает, открыть или пролистать.

**Размер 1200 × 630, PNG, до 250 КБ. Левая треть кадра должна остаться
тёмной и пустой — туда ляжет заголовок.**

```
A dark cyberpunk night scene in a restrained 1980s terminal aesthetic:
a quiet workstation lit only by the cyan glow of a CRT monitor, seen from
behind and slightly above. Beyond the window, a cold night city sleeps in
deep blue haze. Nothing is happening yet — the moment before work begins.

Mood: calm, inviting, unhurried. Late night, coffee gone cold, everything
still ahead.

Strict palette: near-black blue background #081018, cyan #67e8f9 as the main
light source, mint green #72f1b8 and violet #a78bfa as faint accents, muted
grey-blue #8ea2ae for distance. Flat, cinematic, restrained. Subtle grain
allowed.

Composition: THE LEFT THIRD OF THE IMAGE MUST STAY DARK AND EMPTY — no
subject, no detail, no bright areas there; text will be placed over it. All
visual interest belongs in the right two thirds.

Negative: no text, no letters, no numbers, no logos, no watermark, no people,
no faces, no glossy 3D render, no lens flare, no neon signage, no purple-pink
synthwave sunset, no grid horizon cliche.
```

---

## Если захочется ещё: шестнадцать иконок шагов

Это задача не для генератора картинок, а для написания SVG руками — растровые
иконки не подойдут, они перекрашиваются кодом под состояния «пройдено»,
«доступно» и «закрыто».

Условия: **SVG 24 × 24, монолиния, толщина обводки 1.5, `stroke="currentColor"`,
без заливки и без вшитых цветов**, узнаваемо при размере 24 пикселя.
Таблица «файл — шаг — что изобразить» лежит в `docs/art-brief.md`.

Без иконок карта работает как сейчас, так что это можно отложить.

---

## Как прислать

Архивом с файлами `finale.png` и `og.png` — имена важны, тогда подключу без
переименования. Если генератор отдаст другой размер, ничего страшного:
обрежу сам, лишь бы пропорции были близкими и левая треть у `og.png`
осталась пустой.
