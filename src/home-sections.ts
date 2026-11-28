// Розширені секції головної сторінки: цифри, «чому Iteris», приклад завдання, рівні курсів, маршрути, мотивація, поради.
// Чистий модуль (без DOM і мережі): той самий HTML малює браузер, а збірка робить із нього готову сторінку. Стилі: home.css (префікс hm-).
// Усі цифри беруться з каталогу курсів (data.ts), а не вписані вручну, тому не розходяться з сайтом.
import { C, landingKeys, refMeta } from "./data.ts";
import { ACHIEVEMENTS, achIcon } from "./data/achievements.ts";
import { courseName } from "./i18n-data.ts";
import { cnt, l, tr } from "./i18n.ts";

const nLanding = landingKeys().length;
const nLandingLessons = landingKeys().reduce((n, k) => n + C[k].lessons, 0);

/** Прості лінійні іконки 24x24 (колір береться з currentColor) */
const ICONS: Record<string, string> = {
  terminal: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 10 3 2.5L7 15M13 15h4"/>',
  check: '<path d="M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6l-8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2V5Z"/><path d="M4 20a2 2 0 0 0 2 2h13"/><path d="M9 8h6M9 12h4"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4V3h6v1M9 11l2 2 4-4M9 17h6"/>',
};
const ico = (name: string): string => `<svg class="hm-ico" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] ?? ""}</svg>`;

/** Смуга з головними цифрами одразу під першим екраном */
export const homeStatsHtml = (): string => `
  <section class="hm-stats" aria-label="${tr("Платформа в цифрах", "The platform in numbers")}">
    <div><b>${nLanding}</b><span>${tr("мов і технологій", "languages and technologies")}</span></div>
    <div><b>${nLandingLessons}</b><span>${tr("уроків із прикладами коду", "lessons with code examples")}</span></div>
    <div><b>2</b><span>${tr("рівні в курсах: базовий і просунутий", "levels in courses: base and advanced")}</span></div>
    <div><b>${tr("0 ₴", "$0")}</b><span>${tr("вартість навчання, назавжди", "cost of learning, forever")}</span></div>
  </section>`;

/** Шість причин вчитись тут */
export const homeWhyHtml = (): string => {
  const cards: readonly (readonly [string, string, string])[] = [
    ["terminal", tr("Код у браузері", "Code in the browser"), tr("Редактор, термінал і перевірка відкриваються просто на сторінці, нічого встановлювати не треба. JavaScript виконується на вашому пристрої, інші мови на сервері.", "The editor, terminal and checking open right on the page, nothing to install. JavaScript runs on your device, other languages run on a server.")],
    ["check", tr("Перевірка без ШІ", "Checking without AI"), tr("Автоматичні тести порівнюють результат із вимогами. Ви бачите вивід програми й галочку за кожну вимогу: що виконано, а що ні.", "Automatic tests compare the result with the requirements. You see the program output and a tick for every requirement: what is done and what is not.")],
    ["book", tr("Уроки в єдиному форматі", "Lessons in one format"), tr("«Простими словами», приклад коду, «Запам'ятайте», «Як це в роботі» і самоперевірка. Один урок, одна нова ідея.", "“In plain words”, a code example, “Remember”, “How it is used at work” and a self-check. One lesson, one new idea.")],
    ["search", tr("Довідник без реєстрації", "A reference with no sign-up"), tr("Синтаксис кожної мови з короткими прикладами відкритий усім. Зручно швидко згадати, як це писати.", "The syntax of every language with short examples is open to everyone. Handy for a quick reminder of how to write something.")],
    ["phone", tr("Зручно з телефона", "Works on a phone"), tr("Сторінки перевірено на екранах від 360 пікселів, а на телефоні замість важкого редактора відкривається простий.", "Pages are tested on screens from 360 pixels wide, and phones get a simple editor instead of the heavy one.")],
    ["clipboard", tr("Проєкти за ТЗ", "Projects from a spec"), tr("Технічне завдання, невеликий продукт і звіт «виконано X з N». Проєкти вже є в JavaScript, Python, Java і Go.", "A specification, a small product and a “done X of N” report. Projects already exist in JavaScript, Python, Java and Go.")],
  ];
  return `
  <section aria-labelledby="why">
    <h2 class="section-title" id="why">${tr("Чому вчитись тут", "Why learn here")}</h2>
    <p class="section-sub">${tr("Шість речей, які зроблено так, щоб навчання не заважало самому навчанню.", "Six things built so that the tooling never gets in the way of learning.")}</p>
    <div class="hm-grid">
      ${cards.map(([i, h, p]) => `<article class="hm-card">${ico(i)}<h3>${h}</h3><p>${p}</p></article>`).join("")}
    </div>
  </section>`;
};

/** Приклад завдання з перевіркою: те, що людина побачить у терміналі */
export const homeTaskHtml = (ctaHtml: string): string => `
  <section class="hm-task" aria-labelledby="ex">
    <div>
      <h2 class="section-title" id="ex" style="margin-top:72px">${tr("Так виглядає завдання", "This is what a task looks like")}</h2>
      <p class="section-sub">${tr("Умова, заготовка коду й список вимог. Натискаєте «Запустити», і кожна вимога отримує галочку або хрестик з підказкою, що виправити.", "A statement, a starter snippet and a list of requirements. You press “Run”, and every requirement gets a tick or a cross with a hint on what to fix.")}</p>
      <ul class="hm-ticks">
        <li>${tr("Підказка біля кожної невиконаної вимоги", "A hint next to every failed requirement")}</li>
        <li>${tr("Спроб скільки завгодно, без штрафів", "As many attempts as you like, no penalties")}</li>
        <li>${tr("XP за завдання нараховуються один раз", "XP for a task is awarded once")}</li>
      </ul>
      ${ctaHtml}
    </div>
    <div class="hm-term" role="img" aria-label="${tr("Приклад: завдання «Сума чисел» і результат перевірки, виконано 2 з 3", "Example: the “Sum of numbers” task and its check result, 2 of 3 done")}">
      <div class="hm-term-top"><i></i><i></i><i></i><span>${tr("Завдання: сума чисел", "Task: sum of numbers")}</span></div>
      <pre class="hm-code"><span class="k">def</span> <span class="f">add</span>(a, b):
    <span class="c">${tr("# поверніть суму a і b", "# return the sum of a and b")}</span>
    <span class="k">return</span> a - b</pre>
      <ul class="hm-checks">
        <li class="ok"><span aria-hidden="true">✓</span>${tr("Функція add існує", "Function add exists")}</li>
        <li class="ok"><span aria-hidden="true">✓</span>${tr("add(2, 0) повертає 2", "add(2, 0) returns 2")}</li>
        <li class="no"><span aria-hidden="true">✗</span>${tr("add(2, 3) повертає 5", "add(2, 3) returns 5")}<em>${tr("Підказка: перевірте знак операції", "Hint: check the operator")}</em></li>
      </ul>
      <div class="hm-score"><b>${tr("Виконано 2 з 3", "Done 2 of 3")}</b><span class="bar"><i style="width:66%"></i></span></div>
    </div>
  </section>`;

/** Два рівні в курсах: скільки уроків у базовому й у просунутому */
export const homeLevelsHtml = (): string => {
  const keys = landingKeys().filter((k) => C[k].base && C[k].base! < C[k].lessons);
  const max = Math.max(...keys.map((k) => C[k].lessons));
  return `
  <section aria-labelledby="lv">
    <h2 class="section-title" id="lv">${tr("Два рівні в кожному великому курсі", "Two levels in every big course")}</h2>
    <p class="section-sub">${tr("Базовий рівень містить усе, щоб упевнено почати й закріпитись. Просунутий додає глибші теми. Рівень можна змінити будь-коли, а номери уроків не змінюються.", "The base level has everything you need to start confidently and settle in. The advanced level adds deeper topics. You can switch the level at any time, and lesson numbers never change.")}</p>
    <div class="hm-levels" role="list">
      ${keys.map((k) => {
        const base = C[k].base!, adv = C[k].lessons - base;
        return `<div class="hm-lv" role="listitem"><a class="hm-lv-name" href="${l("/ref/" + k)}"><span class="badge sm" style="background:${refMeta(k).color}">${C[k].badge}</span>${courseName(k)}</a><span class="hm-lv-bar" aria-hidden="true"><i class="b" style="width:${(base / max * 100).toFixed(1)}%"></i><i class="a" style="width:${(adv / max * 100).toFixed(1)}%"></i></span><span class="hm-lv-n">${base} + ${adv}</span></div>`;
      }).join("")}
    </div>
    <p class="hm-legend"><span><i class="b"></i>${tr("базовий рівень", "base level")}</span><span><i class="a"></i>${tr("просунуті уроки", "advanced lessons")}</span></p>
  </section>`;
};

/** Маршрути за напрямами: з чого й у якому порядку вчити мови */
export const homeRoutesHtml = (): string => {
  const routes: readonly (readonly [string, string, readonly string[]])[] = [
    [tr("Сайти", "Websites"), tr("Розмітка, оформлення й поведінка сторінки: від першого тегу до інтерактивного сайту.", "Markup, styling and behaviour: from the first tag to an interactive site."), ["html", "css", "js"]],
    [tr("Сервери й дані", "Servers and data"), tr("Проста мова для старту, запити до баз даних і швидка мова для сервісів.", "A friendly first language, database queries and a fast language for services."), ["python", "sql", "go"]],
    [tr("Системне програмування", "Systems programming"), tr("Пам'ять, вказівники й швидкість: від C до сучасного C++ і Go.", "Memory, pointers and speed: from C to modern C++ and Go."), ["c", "cpp", "go"]],
    [tr("Великі застосунки", "Large applications"), tr("Типізована мова з багатою екосистемою й мова запитів до даних.", "A typed language with a rich ecosystem, plus the language of data queries."), ["java", "sql"]],
  ];
  const ok = (k: string): boolean => !!C[k] && !C[k].landingHidden;
  return `
  <section aria-labelledby="routes">
    <h2 class="section-title" id="routes">${tr("З чого почати: чотири маршрути", "Where to start: four routes")}</h2>
    <p class="section-sub">${tr("Порядок підказка, а не вимога: будь-який курс можна відкрити окремо.", "The order is a suggestion, not a requirement: any course can be opened on its own.")}</p>
    <div class="hm-routes">
      ${routes.map(([h, p, ks]) => `<article class="hm-route"><h3>${h}</h3><p>${p}</p><ol>${ks.filter(ok).map((k) => `<li><a href="${l("/ref/" + k)}"><span class="badge sm" style="background:${refMeta(k).color}">${C[k].badge}</span>${courseName(k)}<small>${cnt(C[k].lessons, "lesson")}</small></a></li>`).join("")}</ol></article>`).join("")}
    </div>
  </section>`;
};

/** Мотивація без тиску: денна ціль і значки досягнень */
export const homeMotivationHtml = (): string => {
  const goals: readonly (readonly [number, string])[] = [[1, tr("Легко", "Easy")], [2, tr("Звичайно", "Steady")], [3, tr("Серйозно", "Serious")], [5, tr("Інтенсив", "Intense")]];
  const en: Record<string, string> = { lesson1: "First lesson", task1: "First task", streak7: "7-day streak", level5: "Level 5", lesson50: "50 lessons", course1: "Course complete" };
  const picks = ["lesson1", "task1", "streak7", "level5", "lesson50", "course1"].map((id) => ACHIEVEMENTS.find((a) => a.id === id)).filter((a) => !!a);
  return `
  <section class="hm-motiv" aria-labelledby="mt">
    <div>
      <h2 class="section-title" id="mt">${tr("Мотивація без тиску", "Motivation without pressure")}</h2>
      <p class="section-sub">${tr("Ви самі обираєте денну ціль: скільки кроків (новий урок або вперше пройдене завдання) зробити за день. Прогрес видно в серії днів, у рівні й у значках.", "You choose your own daily goal: how many steps (a new lesson or a task solved for the first time) to take each day. Progress shows in your streak, your level and your badges.")}</p>
      <div class="hm-goals" role="img" aria-label="${tr("Варіанти денної цілі: 1, 2, 3 або 5 кроків", "Daily goal options: 1, 2, 3 or 5 steps")}">
        ${goals.map(([n, t], i) => `<span class="${i === 1 ? "on" : ""}"><b>${n}</b>${t}</span>`).join("")}
      </div>
      <p class="lp-note">${tr("Ваш прогрес приватний: ви самі вирішуєте, чи показувати свою сторінку іншим.", "Your progress is private: you decide whether to show your page to others.")}</p>
    </div>
    <div class="hm-badges" role="img" aria-label="${tr("Приклади значків досягнень", "Examples of achievement badges")}">
      ${picks.map((a, i) => `<div class="hm-badge ${i < 3 ? "got" : ""}">${achIcon(a!.icon)}<b>${tr(a!.title, en[a!.id] ?? a!.title)}</b></div>`).join("")}
    </div>
  </section>`;
};

/** Шість порад, як вчитись ефективно */
export const homeTipsHtml = (): string => {
  const tips: readonly (readonly [string, string])[] = [
    [tr("Щодня потроху", "A little every day"), tr("20–30 хвилин щодня дають більше, ніж п'ять годин раз на тиждень.", "20–30 minutes a day beats five hours once a week.")],
    [tr("Пишіть руками", "Type it yourself"), tr("Не копіюйте приклад, а набирайте його: так запам'ятовується синтаксис.", "Do not copy the example, type it: that is how syntax sticks.")],
    [tr("Ламайте й лагодьте", "Break it and fix it"), tr("Змініть значення в прикладі й подивіться, що станеться. Помилка теж результат.", "Change a value in the example and see what happens. An error is a result too.")],
    [tr("Читайте помилки", "Read the errors"), tr("Повідомлення про помилку зазвичай каже, де й що не так. Прочитайте його повністю.", "An error message usually says where and what is wrong. Read all of it.")],
    [tr("Малі проєкти", "Small projects"), tr("Після теми складіть щось своє, хай навіть на десять рядків.", "After a topic, build something of your own, even ten lines long.")],
    [tr("Повертайтесь до пройденого", "Revisit what you learned"), tr("Через кілька днів відкрийте старий урок і розв'яжіть завдання без підглядання.", "A few days later, reopen an old lesson and solve its task without peeking.")],
  ];
  return `
  <section aria-labelledby="tips">
    <h2 class="section-title" id="tips">${tr("Як вчитись ефективно", "How to learn effectively")}</h2>
    <p class="section-sub">${tr("Шість звичок, які однаково працюють у будь-якій мові.", "Six habits that work the same in any language.")}</p>
    <ol class="hm-tips">
      ${tips.map(([h, p]) => `<li><h3>${h}</h3><p>${p}</p></li>`).join("")}
    </ol>
  </section>`;
};
