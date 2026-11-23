/* Курс CSS (розширений до 40 уроків): глави й уроки в порядку проходження. adv: true — урок лише для просунутого рівня.
   keep — id завдання зі старої версії курсу (13 уроків), яке переходить до цього уроку, щоб не губився прогрес. */
const ch = (id, name, lessons) => ({ id, name, lessons });
const L = (t, adv = false, keep) => ({ t, adv, ...(keep ? { keep } : {}) });

const CHAPTERS = [
  ch("01", "Початок", [
    L("Що таке CSS і як його підключити"),
    L("Правила, властивості й значення"),
    L("Селектори: теги, класи й id", false, "css-selectors"),
    L("DevTools: дивимось і змінюємо стилі"),
  ]),
  ch("02", "Селектори", [
    L("Комбінатори: нащадки, діти й сусіди"),
    L("Атрибутні селектори"),
    L("Псевдокласи", false, "css-pseudo"),
    L("Псевдоелементи"),
    L(":nth-child, :is, :where, :not і :has", true),
  ]),
  ch("03", "Каскад", [
    L("Каскад і порядок правил", false, "css-cascade"),
    L("Специфічність"),
    L("Успадкування, !important і @layer", true),
  ]),
  ch("04", "Кольори, одиниці й текст", [
    L("Кольори: hex, rgb і hsl", false, "css-colors-units"),
    L("Одиниці довжини: px, rem, em, % і vw"),
    L("Шрифти й веб-шрифти"),
    L("Текст: інтервали, вирівнювання й перенос"),
    L("Фони й градієнти", false, "css-text-backgrounds"),
    L("Рамки, заокруглення й тіні"),
  ]),
  ch("05", "Блочна модель", [
    L("Блочна модель", false, "css-box-model"),
    L("margin, padding і схлопування відступів"),
    L("Розміри: width, max-width, overflow і aspect-ratio"),
  ]),
  ch("06", "Потік і позиціонування", [
    L("display і нормальний потік", false, "css-display-position"),
    L("position: relative, absolute, fixed і sticky"),
    L("z-index і контексти накладання", true),
  ]),
  ch("07", "Flexbox", [
    L("Flexbox: основи", false, "css-flexbox"),
    L("Вирівнювання й gap"),
    L("flex-grow, flex-shrink і flex-basis"),
    L("Типові розкладки на Flexbox"),
  ]),
  ch("08", "Grid", [
    L("Grid: основи", false, "css-grid"),
    L("fr, repeat, minmax і auto-fit"),
    L("Області й вирівнювання в Grid"),
    L("Grid чи Flexbox: вкладені сітки", true),
  ]),
  ch("09", "Адаптивність", [
    L("Медіа-запити й мобільний підхід", false, "css-responsive"),
    L("Плавні розміри: clamp, min і max"),
    L("Контейнерні запити", true),
  ]),
  ch("10", "Змінні й анімації", [
    L("Змінні CSS", false, "css-variables-dark"),
    L("Темна тема й color-scheme"),
    L("Переходи й трансформації", false, "css-transitions"),
    L("Анімації: @keyframes"),
  ]),
  ch("11", "Практика", [
    L("Практика: сторінка-портфоліо", false, "css-portfolio-practice"),
  ]),
];

let n = 0;
export const CSS_CHAPTERS = CHAPTERS.map((c) => {
  const from = n + 1;
  n += c.lessons.length;
  return { id: c.id, name: c.name, from, to: n, lessons: c.lessons.map((l, i) => ({ n: from + i, ...l })) };
});
export const CSS_OUTLINE = CSS_CHAPTERS.flatMap((c) => c.lessons.map((l) => ({ ...l, ch: c.name })));
