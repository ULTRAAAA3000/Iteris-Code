// Сторінка «Що нового»: записи про випущене (найновіші зверху) і анонс «Скоро». Модуль чистий (без DOM): той самий HTML малює браузер, а збірка робить із нього готову сторінку.
// Записи пишемо для користувача, простою мовою: що з'явилось і чим це корисно, без внутрішніх подробиць. Внутрішня історія розробки лишається в Documentation/about.md.
import { idolSrc } from "./data/idols.ts";
import { getLang, l, tr } from "./i18n.ts";
import { esc } from "./util.ts";

export const NEWS_PATH = "/whats-new";
export const NEWS_TITLE = "Що нового";
export const newsTitle = (): string => tr(NEWS_TITLE, "What's new");

export interface Release {
  /** Дата ДД.ММ.РРРР: з неї робиться і відображуваний текст, і атрибут datetime */
  date: string;
  items: readonly string[];
  /** Той самий запис англійською: стільки ж пунктів у тому самому порядку (це перевіряє tests/i18n.test.mjs) */
  en: readonly string[];
}

/** Випущене, від новішого до старішого. Додаючи запис, ставте його першим */
export const RELEASES: readonly Release[] = [
  { date: "27.11.2026", items: [
    "Курси Java і JavaScript тепер повні: по 110 уроків у 12 главах і по завданню до кожного уроку з перевіркою вашого коду.",
    "У Java і JavaScript є перемикач «Базовий / Просунутий»: 80 базових уроків і ще 30 просунутих, рівень можна змінити будь-коли.",
    "Нові теми в Java: потоки й пули, колекції та generics, мережа без сокетів, архітектура сервісу, тестування й проєкти. У JavaScript: асинхронність, патерни, тестування в стилі Vitest, мережа й браузер, невеликі проєкти.",
    "Java і JavaScript знову на головній сторінці поруч з іншими завершеними курсами."
  ], en: [
    "The Java and JavaScript courses are now complete: 110 lessons each in 12 chapters, with a task for every lesson and checking of your code.",
    "Java and JavaScript now have the “Basic / Advanced” switch: 80 basic lessons plus 30 advanced ones, and you can change the level at any time.",
    "New topics in Java: threads and pools, collections and generics, networking without sockets, service architecture, testing and projects. In JavaScript: asynchrony, patterns, Vitest-style testing, network and browser work, and small projects.",
    "Java and JavaScript are back on the home page next to the other finished courses."
  ] },
  { date: "24.11.2026", items: [
    "Курс HTML став значно більшим: 30 уроків по главах від першої сторінки до форм, семантики, доступності й SEO. Базовий рівень 23 уроки, ще 7 просунутих, а перемикати рівень можна будь-коли.",
    "До кожного уроку HTML додано практичне завдання з живою перевіркою сторінки: ви пишете розмітку, натискаєте «Запустити» й бачите, які вимоги виконано.",
    "Нові теми в HTML: посилання й шляхи, адаптивні зображення, аудіо й відео, таблиці та доступні таблиці, перевірка форм, ARIA, мета-теги й Open Graph, елементи details, dialog і progress.",
    "Курс SQL виріс до 35 уроків у 10 главах: від першого SELECT до JOIN, підзапитів, віконних функцій, індексів, транзакцій і роботи з базою з Python. Базовий рівень 30 уроків, ще 5 просунутих, і до кожного уроку є завдання з перевіркою запиту."
  ], en: [
    "The HTML course is much bigger: 30 lessons in chapters, from your first page to forms, semantics, accessibility and SEO. The basic level is 23 lessons, with 7 more advanced ones, and you can switch the level at any time.",
    "Every HTML lesson now has a practical task with live page checking: you write the markup, press “Run” and see which requirements are met.",
    "New HTML topics: links and paths, responsive images, audio and video, tables and accessible tables, form validation, ARIA, meta tags and Open Graph, and the details, dialog and progress elements.",
    "The SQL course has grown to 35 lessons in 10 chapters: from your first SELECT to JOINs, subqueries, window functions, indexes, transactions and working with a database from Python. The basic level is 30 lessons plus 5 advanced ones, and every lesson has a task that checks your query."
  ] },
  { date: "23.11.2026", items: [
    "Курси Python і C++ тепер повні: по 110 уроків у 12 главах і по завданню до кожного уроку з перевіркою вашого коду.",
    "У Python і C++ є перемикач «Базовий / Просунутий»: 80 базових уроків і ще 30 просунутих, рівень можна змінити будь-коли.",
    "Уроки стало легше читати: приклад коду стоїть одразу за поясненням, довгі абзаци розбито, а кнопки A− і A+ змінюють розмір тексту.",
    "Уроки відкриваються через «Шлях»: хлібні крихти й кнопка в кінці уроку ведуть на нього, а окремий список уроків курсу тимчасово сховано."
  ], en: [
    "The Python and C++ courses are now complete: 110 lessons each in 12 chapters, with a task for every lesson and checking of your code.",
    "Python and C++ now have the “Basic / Advanced” switch: 80 basic lessons plus 30 advanced ones, and you can change the level at any time.",
    "Lessons are easier to read: a code example sits right after its explanation, long paragraphs are split up, and the A− and A+ buttons change the text size.",
    "Lessons open through the Path: the breadcrumbs and the button at the end of a lesson lead to it, and the separate course lesson list is hidden for now."
  ] },
  { date: "17.11.2026", items: [
    "Досягнення в профілі: значки за перший урок і завдання, 10 і 50 уроків, серії 3, 7 і 30 днів, 5-й і 10-й рівні та пройдений курс.",
    "Сторінка «Підтримка»: напишіть нам про помилку, ідею або те, що хочеться бачити красивішим. Відповідь прийде на вашу пошту.",
    "У кабінеті з'явилась плашка «Цікавий факт»: нова порція про обрану вами мову кожні 5 годин, майже 400 фактів і порад.",
    "Практика для SQL і Bash: пишете код, натискаєте «Запустити» й одразу бачите, які вимоги виконано.",
    "Верхня картка кабінету на телефоні стала акуратнішою: кнопки більше не збиваються в один бік."
  ], en: [
    "Achievements on your profile: badges for the first lesson and task, 10 and 50 lessons, 3, 7 and 30-day streaks, levels 5 and 10, and a finished course.",
    "A “Support” page: tell us about a bug, an idea or something you would like to look nicer. The reply will come to your email.",
    "A “Fun fact” card in your account: a new portion about your chosen language every 5 hours, almost 400 facts and tips.",
    "Practice for SQL and Bash: you write code, press “Run” and immediately see which requirements are met.",
    "The top card of the account on a phone is tidier: the buttons no longer bunch up on one side.",
  ] },
  { date: "16.11.2026", items: [
    "Публічний профіль: коротка сторінка про вас із героєм-аватаркою (одинадцять героїв платформи), мовами, прогресом і картою активності. Профіль можна закрити, а нік задається один раз.",
    "Кабінет став яскравішим: привітання, кільця прогресу, графік активності за 14 днів, радар навичок, нагороди за серію й календар із підсумками.",
    "Практика для Python, Java, C++, PHP, Pascal і TypeScript, ще 14 завдань для JavaScript, а в HTML і CSS завдання з живим переглядом сторінки.",
    "Нова головна, сторінки «Курси», «Як це працює», «Про проєкт» і довідник по кожній мові, відкритий без реєстрації. Адреси тепер звичайні, без «#».",
    "Уроки й завдання відкриваються в кабінеті після входу. На сторінці уроку теорія йде вгорі, а завдання під нею.",
    "Шлях на телефоні тепер вертикальна стрічка: назви уроків і завдання читаються на всю ширину.",
    "Вхід через GitHub поруч із Google і поштою."
  ], en: [
    "Public profile: a short page about you with a hero avatar (eleven platform heroes), languages, progress and an activity map. A profile can be hidden, and the nickname is set only once.",
    "The account got brighter: a greeting, progress rings, a 14-day activity chart, a skills radar, streak rewards and a calendar with summaries.",
    "Practice for Python, Java, C++, PHP, Pascal and TypeScript, 14 more tasks for JavaScript, and tasks with a live page preview in HTML and CSS.",
    "A new home page, the “Courses”, “How it works” and “About” pages, and a reference for every language, open without registration. Addresses are now ordinary, without “#”.",
    "Lessons and tasks open in your account after sign-in. On a lesson page the theory comes first and the task below it.",
    "On a phone the path is now a vertical ribbon: lesson titles and tasks are readable across the full width.",
    "Sign-in with GitHub next to Google and email.",
  ] },
  { date: "15.11.2026", items: [
    "Рівні й XP: за кожен урок і завдання ви отримуєте очки, а від них залежить рівень. Додано серію днів і календар активності.",
    "Після входу ви обираєте мову й рівень, а платформа будує «Мій шлях» по главах і показує, що робити далі.",
    "Перші завдання з перевіркою коду: 11 завдань для Go, код виконується безпечно на сервері."
  ], en: [
    "Levels and XP: you earn points for every lesson and task, and your level depends on them. A day streak and an activity calendar were added.",
    "After signing in you choose a language and a level, and the platform builds “My path” by chapters and shows what to do next.",
    "The first tasks with code checking: 11 tasks for Go, with code running safely on the server.",
  ] },
  { date: "14.11.2026", items: [
    "Вхід через Google, а також реєстрація за поштою й паролем із підтвердженням адреси."
  ], en: [
    "Sign-in with Google, as well as registration by email and password with address confirmation.",
  ] },
];

export interface Soon {
  hero: string;
  title: string;
  text: string;
  titleEn: string;
  textEn: string;
}

/** Анонс майбутніх можливостей. Це плани без дат: склад і порядок можуть змінитися */
export const SOON: readonly Soon[] = [
  { hero: "zak", title: "Монети", text: "Окрема валюта, яку можна заробити навчанням: за уроки, завдання й серії. XP при цьому нікуди не зникають, а все, що ви вже заробили, не пропаде.", titleEn: "Coins", textEn: "A separate currency you can earn by studying: for lessons, tasks and streaks. Your XP does not go anywhere, and everything you have already earned stays safe." },
  { hero: "limo", title: "Магазин", text: "Тут монети можна буде витратити: оформлення й рамки профілю, додаткові завдання, заморожування серії, коли треба перепочити.", titleEn: "Shop", textEn: "Here you will be able to spend coins: profile themes and frames, extra tasks, streak freezes for when you need a rest." },
  { hero: "mo", title: "Напарник", text: "Один із героїв платформи стане вашим особистим напарником: росте разом із вашим рівнем, радіє успіхам і підбадьорює, коли серія під загрозою.", titleEn: "Companion", textEn: "One of the platform's heroes will become your personal companion: it grows with your level, celebrates your wins and cheers you up when your streak is in danger." },
];

const dateAttr = (d: string): string => d.split(".").reverse().join("-");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Дата для людей: 17.11.2026 українською, 17 Nov 2026 англійською */
const dateLabel = (d: string): string => { const [dd, mm, yy] = d.split("."); return getLang() === "en" ? `${+dd} ${MONTHS[+mm - 1]} ${yy}` : d; };

/** HTML сторінки. Хлібні крихти передає pages.ts (так само, як для «Підтримки»), щоб не було циклічних імпортів */
export function newsHtml(crumbs: string): string {
  const soon = SOON.map((s, i) => `<li class="nw-card" style="--i:${i}">
      <img class="nw-hero" src="${idolSrc(s.hero)}" width="72" height="72" alt="" loading="lazy" decoding="async">
      <div><h3>${esc(tr(s.title, s.titleEn))} <span class="nw-tag">${tr("Скоро", "Soon")}</span></h3><p>${esc(tr(s.text, s.textEn))}</p></div>
    </li>`).join("");
  const rel = RELEASES.map((r, i) => `<article class="nw-rel" style="--i:${i}">
      <h3><time datetime="${dateAttr(r.date)}">${esc(dateLabel(r.date))}</time></h3>
      <ul>${tr(r.items, r.en).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    </article>`).join("");
  return `
  ${crumbs}
  <h1 class="lp-h1">${tr("Що нового і що скоро", "What's new and what's coming")}</h1>
  <p class="section-sub">${tr("Платформа росте частинами: нові можливості з'являються по кілька разів на тиждень. Тут усе, що вже випущено, і що ми готуємо далі.", "The platform grows in parts: new features appear several times a week. Here is everything already released and what we are preparing next.")}</p>
  <section class="nw-soon" aria-labelledby="soon">
    <h2 class="section-title" id="soon">${tr("Скоро", "Coming soon")}</h2>
    <ul class="nw-cards">${soon}</ul>
    <p class="lp-note">${tr(`Це плани, а не обіцянки з датами: порядок і склад можуть змінитися. Є думка, що додати першим? <a href="${l("/contact")}">Напишіть нам</a>.`, `These are plans, not promises with dates: the order and contents may change. Have an idea of what to add first? <a href="${l("/contact")}">Write to us</a>.`)}</p>
  </section>
  <section class="nw-log" aria-labelledby="done">
    <h2 class="section-title" id="done">${tr("Уже випущено", "Already released")}</h2>
    <div class="nw-rels">${rel}</div>
  </section>`;
}
