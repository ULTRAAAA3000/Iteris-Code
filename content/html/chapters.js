/* Курс HTML (розширений до 30 уроків): глави й уроки в порядку проходження. adv: true — урок лише для просунутого рівня.
   keep — id завдання зі старої версії курсу (12 уроків), яке переходить до цього уроку, щоб не губився прогрес. */
const ch = (id, name, lessons) => ({ id, name, lessons });
const L = (t, adv = false, keep) => ({ t, adv, ...(keep ? { keep } : {}) });

const CHAPTERS = [
  ch("01", "Початок", [
    L("Як працює веб: браузер, сервер і HTML"),
    L("Структура HTML-документа", false, "html-skeleton"),
    L("Елементи, атрибути й вкладеність"),
    L("Інструменти: DevTools, валідатор і типові помилки"),
  ]),
  ch("02", "Текст", [
    L("Заголовки й абзаци"),
    L("Смислове форматування тексту", false, "html-text-format"),
    L("Цитати, код і попередньо відформатований текст", true),
    L("Списки: ul, ol і dl", false, "html-headings-lists"),
    L("Спеціальні символи, переноси й пробіли"),
  ]),
  ch("03", "Посилання й шляхи", [
    L("Посилання: a, href, target і rel"),
    L("Шляхи до файлів і структура проєкту", false, "html-project-paths"),
    L("Якорі, mailto і tel"),
    L("Навігація на списках: меню сайту", true),
  ]),
  ch("04", "Медіа", [
    L("Зображення: img, alt і формати", false, "html-media"),
    L("figure, srcset і picture", true),
    L("Аудіо й відео"),
    L("iframe і вбудований вміст", true),
  ]),
  ch("05", "Таблиці", [
    L("Таблиця: table, tr, th і td"),
    L("caption, thead, tbody, tfoot, colspan і rowspan"),
    L("Доступні таблиці", true),
  ]),
  ch("06", "Форми", [
    L("Форма: form, input, label і button", false, "html-table-form"),
    L("Типи полів input", false, "html-form-fields"),
    L("select, textarea, radio, checkbox і fieldset"),
    L("Валідація форм: required, pattern, min і max"),
    L("Доступність форм і повідомлення про помилки", true),
  ]),
  ch("07", "Семантика й доступність", [
    L("Семантична розмітка: header, main, article, section, aside, footer", false, "html-semantic"),
    L("Доступність: alt, ARIA, фокус і клавіатура", false, "html-a11y"),
    L("Мета-теги, SEO й Open Graph", false, "html-seo-meta"),
    L("Сучасні елементи: details, dialog, progress і meter", true),
  ]),
  ch("08", "Практика", [
    L("Практика: сторінка-портфоліо", false, "html-portfolio"),
  ]),
];

let n = 0;
export const HTML_CHAPTERS = CHAPTERS.map((c) => {
  const from = n + 1;
  n += c.lessons.length;
  return { id: c.id, name: c.name, from, to: n, lessons: c.lessons.map((l, i) => ({ n: from + i, ...l })) };
});
export const HTML_OUTLINE = HTML_CHAPTERS.flatMap((c) => c.lessons.map((l) => ({ ...l, ch: c.name })));
