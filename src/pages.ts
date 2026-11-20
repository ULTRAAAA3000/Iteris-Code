// Публічні сторінки сайту (доступні без входу): головна-лендинг, каталог курсів, «Як це працює», «Про проєкт», напрями й довідник мови.
// Модуль чистий (без DOM, мережі й входу): той самий HTML малює браузер, а збірка заздалегідь створює з нього готові сторінки для пошуковиків.
import { C, CATS, darkText, publicLessonTotal } from "./data.ts";
import { REF } from "./data/reference/index.ts";
import { contactHtml } from "./contact.ts";
import { demoHtml } from "./demo.ts";
import { NEWS_PATH, NEWS_TITLE, newsHtml } from "./changelog.ts";
import { PRIVACY_HTML, PRIVACY_TITLE, TERMS_HTML, TERMS_TITLE } from "./legal.ts";
import { count, esc, W } from "./util.ts";

export const BRAND = "Iteris Code";

export interface PageDef {
  /** Адреса: "/", "/courses", "/ref/js" */
  path: string;
  /** Повний заголовок вкладки й пошукової видачі */
  title: string;
  /** Опис для пошуковиків і карток у месенджерах (до ~160 символів) */
  desc: string;
  /** Ключ пункту основного меню, який підсвічується */
  active: string;
  /** Хлібні крихти: [назва, адреса] від головної до поточної сторінки */
  crumbs: readonly (readonly [string, string])[];
  /** Для розмітки JSON-LD: що це за сторінка */
  kind: "home" | "catalog" | "info" | "dir" | "ref";
  /** Часті запитання (лише головна): йдуть і в розмітку FAQPage */
  faq?: readonly (readonly [string, string])[];
  html: (loggedIn: boolean) => string;
}

export const badge = (k: string, cls = ""): string => `<span class="badge ${cls}" style="background:${C[k].color};${darkText(k)}" aria-hidden="true">${esc(C[k].badge)}</span>`;
const sections = (k: string): number => REF[k]?.length ?? 0;
/** Текст у довіднику: `код` у зворотних апострофах стає <code> */
const inline = (s: string): string => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
const crumbsHtml = (items: readonly (readonly [string, string])[]): string =>
  `<nav class="crumbs" aria-label="Де ви"><a href="/">Головна</a>${items.map(([t, h], i) => ` / ${i === items.length - 1 ? `<span aria-current="page">${esc(t)}</span>` : `<a href="${h}">${esc(t)}</a>`}`).join("")}</nav>`;

const nCourses = Object.keys(C).length;
const nLessons = publicLessonTotal();
const LANGS = Object.values(C).map((c) => c.name);

/** Кнопка-заклик: гостю відкриває вхід, користувачу веде в кабінет */
const cta = (loggedIn: boolean, text = "Зареєструйся і вчись безкоштовно"): string =>
  loggedIn ? `<a class="btn primary" href="/path">Продовжити навчання</a>` : `<button class="btn primary" data-act="login">${text}</button>`;

/* ---------- Головна ---------- */

const FAQ: readonly (readonly [string, string])[] = [
  ["Це справді безкоштовно?", "Так. Довідник відкритий усім, а уроки, завдання й особистий кабінет безкоштовні для тих, хто увійшов. Платити не потрібно."],
  ["З чого почати, якщо я ніколи не програмував?", "Після входу оберіть мову й рівень «Новачок»: платформа поставить вас на початок шляху. Для першої мови добре підходять Python, JavaScript або Go."],
  ["Чи потрібно щось встановлювати?", "Ні. Редактор, термінал і перевірка працюють у браузері, у тому числі на телефоні. Код JavaScript виконується на вашому пристрої, код інших мов на сервері."],
  ["Як перевіряються завдання?", "Автоматично, без ШІ: платформа запускає ваш код і порівнює результат із вимогами. Ви бачите вивід програми й галочки за кожним пунктом: наприклад, «пройдено 2 з 3»."],
  ["Чи потрібна реєстрація, щоб користуватись довідником?", "Ні. Довідник по кожній мові відкритий без входу. Вхід потрібен для уроків, завдань, XP і збереження прогресу на всіх пристроях."],
  ["Чи можна вчитись із телефона?", "Так. Усі сторінки перевірено на екранах від 360 пікселів, а на телефоні замість важкого редактора відкривається простий."],
  ["Чи є проєкти за технічним завданням?", "Так. Ви отримуєте технічне завдання, складаєте невеликий продукт і бачите звіт «виконано X з N». Проєкти вже є в курсах JavaScript і Go (по три в Python, Java і Go), інші мови додаватимуться поступово."],
];

export const homeHtml = (loggedIn: boolean): string => `
  <section class="hero" aria-labelledby="h1">
    <div>
      <h1 id="h1">Вчися програмувати. Безкоштовно.</h1>
      <p class="lead">Уроки українською: читаєш, пишеш код у терміналі й одразу бачиш перевірку. ${nCourses} мов, ${nLessons} уроків, без встановлення програм.</p>
      <div class="actions">${cta(loggedIn)}<a class="btn" href="/courses">Дивитись курси</a></div>
      <p class="lp-note">Довідник по мовах відкритий усім, без входу.</p>
    </div>
    <div class="sheet" aria-label="Спробуйте прямо тут">
      <div class="tabs" role="tablist">
        <button role="tab" aria-selected="true" data-tab="p">Python</button>
        <button role="tab" aria-selected="false" data-tab="h">HTML</button>
      </div>
      <div class="pane" data-pane="p">
        <p class="hint">Введіть ім'я й запустіть програму.</p>
        <pre class="code">name = input("Як тебе звати? ")
print("Привіт,", name + "!")</pre>
        <div class="field"><input type="text" id="pyname" value="Олена" aria-label="Ваше ім'я" maxlength="30"><button class="btn small" id="pyrun">Запустити</button></div>
        <div class="out" id="pyout" aria-live="polite"></div>
      </div>
      <div class="pane" data-pane="h" hidden>
        <p class="hint">Змініть текст заголовка: сторінка оновиться одразу.</p>
        <pre class="code" id="htmlcode"></pre>
        <div class="field"><input type="text" id="htmlin" value="Мій перший сайт" aria-label="Текст заголовка" maxlength="40"></div>
        <div class="out render" id="htmlout"></div>
      </div>
    </div>
  </section>

  ${demoHtml()}

  <section aria-labelledby="how">
    <h2 class="section-title" id="how">Як проходить навчання</h2>
    <p class="section-sub">Чотири кроки, які повторюються від теми до теми. Від теорії до коду, який працює.</p>
    <ol class="lp-steps">
      <li class="lp-step">
        <span class="lp-n" aria-hidden="true">1</span>
        <h3>Читаєш урок</h3>
        <p>Коротке пояснення «простими словами», приклад коду й розділ «Як це в роботі».</p>
        <div class="lp-viz" aria-hidden="true"><i class="ln w80"></i><i class="ln w60"></i><b class="cd">print("Привіт!")</b><i class="ln w70"></i></div>
      </li>
      <li class="lp-step">
        <span class="lp-n" aria-hidden="true">2</span>
        <h3>Пишеш код у терміналі</h3>
        <p>Міні-завдання одразу після теорії: редактор, кнопка «Запустити», вивід програми.</p>
        <div class="lp-viz lp-term" aria-hidden="true"><span class="cm">$ запустити</span><span class="ok">✓ Виводить «Привіт, світе!»</span><span class="ok">✓ Без помилок</span><span class="no">✗ Додає ім'я користувача</span></div>
      </li>
      <li class="lp-step">
        <span class="lp-n" aria-hidden="true">3</span>
        <h3>Проєкт за ТЗ</h3>
        <p>Отримуєш технічне завдання й складаєш невеликий продукт, як у справжній роботі. Проєкти вже є в JavaScript, Python, Java і Go.</p>
        <div class="lp-viz lp-spec" aria-hidden="true"><b>ТЗ: калькулятор знижок</b><span>☐ Рахує суму</span><span>☐ Застосовує промокод</span><span>☐ Показує чек</span></div>
      </li>
      <li class="lp-step">
        <span class="lp-n" aria-hidden="true">4</span>
        <h3>Автоматична перевірка</h3>
        <p>Тести без ШІ показують, що виконано, а що ні. Для міні-завдань це працює вже зараз.</p>
        <div class="lp-viz lp-report" aria-hidden="true"><b>Виконано 5 з 6</b><span class="bar"><i style="width:83%"></i></span></div>
      </li>
    </ol>
  </section>

  <section aria-labelledby="path">
    <h2 class="section-title" id="path">Свій шлях, без блокувань</h2>
    <p class="section-sub">Курс розбито на глави. Платформа підкаже, з чого почати за вашим рівнем, але будь-який урок можна відкрити будь-коли.</p>
    <div class="lp-path" role="img" aria-label="Приклад шляху: три глави з уроками, частина пройдена, один поточний">
      <div class="lp-chap"><h3>Глава 1. Перші кроки</h3><div class="dots"><i class="d done"></i><i class="d done"></i><i class="d done"></i><i class="d done"></i></div><small>4 з 4</small></div>
      <div class="lp-chap"><h3>Глава 2. Умови й цикли</h3><div class="dots"><i class="d done"></i><i class="d done"></i><i class="d now"><em>Ви тут</em></i><i class="d"></i><i class="d"></i></div><small>2 з 5</small></div>
      <div class="lp-chap"><h3>Глава 3. Функції</h3><div class="dots"><i class="d"></i><i class="d"></i><i class="d"></i><i class="d"></i></div><small>0 з 4</small></div>
    </div>
  </section>

  <section class="lp-xp" aria-labelledby="xp">
    <div>
      <h2 class="section-title" id="xp" style="margin-top:72px">XP, рівні й серія днів</h2>
      <p class="section-sub">Кожен урок і завдання дають XP. Рівень росте разом з ними, а серія днів допомагає вчитись щодня, хоча б потроху.</p>
      ${cta(loggedIn)}
    </div>
    <div class="card lp-xp-card" aria-hidden="true">
      <div class="lvl"><b>Рівень 3</b><span>140 XP</span></div>
      <div class="xp-bar"><i style="width:62%"></i></div>
      <div class="streak"><span class="fl">🔥</span><b>7 днів поспіль</b></div>
      <div class="lp-heat"><i class="l2"></i><i></i><i class="l1"></i><i class="l3"></i><i class="l2"></i><i class="l4"></i><i class="l1"></i><i class="l3"></i><i class="l2"></i><i></i><i class="l2"></i><i class="l4"></i><i class="l3"></i><i class="l1"></i></div>
    </div>
  </section>

  <section aria-labelledby="langs">
    <h2 class="section-title" id="langs">${nCourses} мов і технологій</h2>
    <p class="section-sub">Оберіть мову, щоб відкрити довідник. Уроки й завдання чекають у кабінеті.</p>
    <div class="ruled">
      ${Object.entries(CATS).map(([key, c]) => `
      <div class="dir">
        <div><h3><a href="/${key}">${c.title}</a></h3><p>${c.desc}</p></div>
        <div class="chips">${c.courses.map(chip).join("")}</div>
      </div>`).join("")}
    </div>
  </section>

  <section aria-labelledby="faq">
    <h2 class="section-title" id="faq">Часті запитання</h2>
    <div class="lp-faq">
      ${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}
    </div>
  </section>

  <section class="lp-cta" aria-labelledby="go">
    <h2 id="go">Готові почати?</h2>
    <p>Реєстрація безкоштовна. Перший урок займає кілька хвилин.</p>
    ${cta(loggedIn)}
  </section>`;

const chip = (k: string): string => `<a class="chip" href="/ref/${k}">${badge(k, "sm")}<span><b>${C[k].name}</b><small>довідник · ${count(C[k].lessons, W.lesson)}</small></span></a>`;

/* ---------- Каталог ---------- */

const catalogHtml = (loggedIn: boolean): string => `
  ${crumbsHtml([["Курси", "/courses"]])}
  <h1 class="lp-h1">Курси програмування</h1>
  <p class="section-sub">${count(nCourses, W.course)} і ${count(nLessons, W.lesson)} українською. Довідник кожної мови відкритий усім, а уроки й завдання доступні після входу.</p>
  <div class="ruled">
    ${Object.entries(CATS).map(([key, c]) => `
    <div class="dir">
      <div><h2><a href="/${key}">${c.title}</a></h2><p>${c.desc}</p></div>
      <div class="chips">${c.courses.map(chip).join("")}</div>
    </div>`).join("")}
  </div>
  <section class="lp-cta"><h2>Уроки й завдання в кабінеті</h2><p>Зареєструйтесь безкоштовно, оберіть мову й рівень, а платформа покаже, з чого почати.</p>${cta(loggedIn)}</section>`;

/* ---------- Як це працює ---------- */

const howHtml = (loggedIn: boolean): string => `
  ${crumbsHtml([["Як це працює", "/how-it-works"]])}
  <h1 class="lp-h1">Як це працює</h1>
  <p class="section-sub">Від першого уроку до практики: що ви побачите на платформі й навіщо кожен елемент.</p>
  <div class="lp-article prose">
    <h2>1. Довідник і кабінет</h2>
    <p><b>Довідник</b> відкритий усім. На сторінці кожної мови зібрано основні конструкції з короткими прикладами: зручно швидко згадати синтаксис.</p>
    <p><b>Кабінет</b> відкривається після входу. У ньому уроки по главах, завдання з перевіркою коду, прогрес, XP і серія днів.</p>
    <h2>2. Свій шлях</h2>
    <p>Після входу ви обираєте мову й рівень: новачок, середній або впевнений. Платформа ставить вас у відповідне місце шляху. Блокувань немає: будь-який урок відкривається в будь-який момент.</p>
    <h2>3. Урок у єдиному форматі</h2>
    <ul>
      <li><b>Простими словами:</b> коротка аналогія замість сухого визначення.</li>
      <li><b>Пояснення й приклад коду:</b> те, що можна скопіювати й запустити.</li>
      <li><b>Запам'ятайте:</b> головна думка уроку в одному реченні.</li>
      <li><b>Як це в роботі:</b> де ця тема трапляється в реальних проєктах.</li>
      <li><b>Самоперевірка:</b> кілька завдань, щоб закріпити матеріал.</li>
    </ul>
    <h2>4. Міні-завдання в терміналі</h2>
    <p>Після теорії ви пишете код у редакторі й натискаєте «Запустити». Термінал показує вивід вашої програми та галочку чи хрестик за кожною вимогою. Перевірка автоматична, без ШІ.</p>
    <p>Практичні завдання вже є в курсах JavaScript і Go. Інші мови додаються поступово. Код JavaScript виконується на вашому пристрої, код інших мов безпечно запускається на сервері.</p>
    <h2>5. XP, рівні та серія днів</h2>
    <p>За кожен урок і завдання ви отримуєте XP. Вони не витрачаються: це показник вашого прогресу, від якого залежить рівень. Серія днів показує, скільки днів поспіль ви вчились, а календар активності зберігає, що саме ви проходили. День рахується за часом UTC.</p>
    <h2>6. Проєкти за технічним завданням</h2>
    <p>Ви отримуєте ТЗ, складаєте невеликий продукт і бачите звіт «виконано X з Y». Кожну вимогу перевіряють автоматичні тести, без ШІ. Проєкти вже є в курсах JavaScript (список справ), Python, Java і Go (по три, код запускається на сервері), інші мови додаватимуться поступово.</p>
  </div>
  <section class="lp-cta"><h2>Спробуйте самі</h2><p>Це безкоштовно. Оберіть мову й пройдіть перший урок.</p>${cta(loggedIn)}</section>`;

/* ---------- Про проєкт ---------- */

const aboutHtml = (loggedIn: boolean): string => `
  ${crumbsHtml([["Про проєкт", "/about"]])}
  <h1 class="lp-h1">Про проєкт</h1>
  <p class="section-sub">${BRAND} — безкоштовна платформа, де можна вивчити мову програмування так, щоб потім працювати.</p>
  <div class="lp-article prose">
    <h2>Для чого це потрібно</h2>
    <p>Багато курсів закінчуються на теорії й абстрактних задачах. Ми робимо навпаки: кожен урок показує, як тема виглядає в реальному проєкті, а практика наближається до справжньої роботи: отримуєш завдання й робиш невеликий продукт.</p>
    <h2>Принципи</h2>
    <ul>
      <li><b>Безкоштовно.</b> Платформа не вимагає оплати, щоб вчитись.</li>
      <li><b>Робота, а не оцінки.</b> Мета: навчитись так, щоб можна було працювати.</li>
      <li><b>Практика після теорії.</b> Спершу пояснення, одразу після нього код.</li>
      <li><b>Вільний шлях.</b> Будь-який урок доступний у будь-який момент.</li>
      <li><b>Без ШІ-перевірок.</b> Завдання перевіряються автоматичними тестами за зрозумілими вимогами.</li>
      <li><b>Простота.</b> Короткі пояснення, зрозумілі аналогії, код блоками.</li>
    </ul>
    <h2>Що всередині</h2>
    <p>${count(nCourses, W.course)}: ${LANGS.join(", ")}. Разом ${count(nLessons, W.lesson)}, розбитих на глави, і довідник по кожній мові. Сайт працює на телефоні.</p>
    <h2>Технології</h2>
    <p>Сайт написаний на TypeScript і працює на Cloudflare.</p>
  </div>
  <section class="lp-cta"><h2>Почніть вчитись</h2><p>Реєстрація безкоштовна.</p>${cta(loggedIn)}</section>`;

/* ---------- Політика й умови ---------- */

const legalHtml = (title: string, path: string, body: string): string => `
  ${crumbsHtml([[title, path]])}
  <h1 class="lp-h1">${title}</h1>
  <div class="lp-article prose legal">${body}</div>`;

/* ---------- Напрям і довідник мови ---------- */

function dirHtml(key: string): string {
  const c = CATS[key];
  return `
  ${crumbsHtml([["Курси", "/courses"], [c.title, "/" + key]])}
  <h1 class="lp-h1">${c.title}</h1>
  <p class="section-sub" style="margin-bottom:32px">${c.desc}</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:24px">
    ${c.courses.map((k) => {
      const x = C[k];
      return `<a class="card" href="/ref/${k}" style="text-decoration:none;display:grid;gap:14px;border-top:10px solid ${x.color}">
        <div style="display:flex;gap:14px;align-items:center">${badge(k)}<h2 style="font-size:1.6rem">${x.name}</h2></div>
        <p style="margin:0">${x.desc}</p>
        <small style="color:var(--muted)">Довідник: ${count(sections(k), W.section)} · ${count(x.lessons, W.lesson)} у кабінеті${x.base ? ` (${x.base} базових і ${x.lessons - x.base} просунутих)` : ""}</small>
      </a>`;
    }).join("")}
  </div>`;
}

function refHtml(k: string, loggedIn: boolean): string {
  const c = C[k], secs = REF[k] ?? [];
  return `
  ${crumbsHtml([["Курси", "/courses"], [CATS[c.cat].title, "/" + c.cat], [c.name, "/ref/" + k]])}
  <div class="course-head">${badge(k)}<div><h1>${c.name}: довідник</h1><p>${c.desc}</p></div></div>
  <nav class="callout" aria-label="Розділи довідника"><b>Розділи.</b> ${secs.map((s, i) => `<a href="#s${i}">${esc(s.t)}</a>`).join(" · ")}</nav>
  <div class="prose ref">
    ${secs.map((s, i) => `<section id="s${i}"><h2>${esc(s.t)}</h2>
      ${s.items.map((x) => `<h3>${esc(x.t)}</h3>${x.note ? `<p>${inline(x.note)}</p>` : ""}<pre class="code">${esc(x.code)}</pre>`).join("")}</section>`).join("")}
  </div>
  <div class="callout"><b>Хочете вчитися крок за кроком?</b> У кабінеті є ${count(c.lessons, W.lesson)} по главах${c.base ? ` (${c.base} базових і ${c.lessons - c.base} просунутих, рівень можна перемикати в будь-який момент)` : ""} і завдання з перевіркою коду. ${loggedIn ? `<a href="/course/${k}">Відкрити курс ${esc(c.name)}</a>` : `<button class="btn small" data-act="login">Увійти й почати</button>`}</div>`;
}

/* ---------- Реєстр сторінок ---------- */

const trim = (s: string, n = 158): string => (s.length <= n ? s : s.slice(0, n - 1).replace(/[\s,;:.]+\S*$/, "") + "…");

/** Усі публічні сторінки: з цього списку працює браузер і збірка (готові сторінки, sitemap) */
export function publicPages(): PageDef[] {
  const pages: PageDef[] = [
    {
      path: "/", kind: "home", active: "home", crumbs: [], faq: FAQ, html: homeHtml,
      title: `${BRAND}: вчися програмувати безкоштовно українською`,
      desc: trim(`Безкоштовні уроки програмування українською: ${LANGS.slice(0, 8).join(", ")} та інші. Читай урок, пиши код у терміналі, отримуй перевірку й XP.`),
    },
    {
      path: "/courses", kind: "catalog", active: "courses", crumbs: [["Курси", "/courses"]], html: catalogHtml,
      title: `Курси програмування: ${nCourses} мов, ${nLessons} уроків | ${BRAND}`,
      desc: trim(`${count(nCourses, W.course)}: ${LANGS.join(", ")}. Довідник без реєстрації, уроки й завдання з перевіркою коду безкоштовно.`),
    },
    {
      path: "/how-it-works", kind: "info", active: "how", crumbs: [["Як це працює", "/how-it-works"]], html: howHtml,
      title: `Як це працює: уроки, термінал, XP | ${BRAND}`,
      desc: "Як проходить навчання: урок простими словами, міні-завдання в терміналі з автоматичною перевіркою, свій шлях без блокувань, XP, рівні та серія днів.",
    },
    {
      path: "/about", kind: "info", active: "about", crumbs: [["Про проєкт", "/about"]], html: aboutHtml,
      title: `Про проєкт | ${BRAND}`,
      desc: `${BRAND}: безкоштовна платформа, де можна вивчити мову програмування так, щоб працювати. Принципи, зміст курсів і технології.`,
    },
    {
      path: "/contact", kind: "info", active: "contact", crumbs: [["Підтримка", "/contact"]], html: () => contactHtml(crumbsHtml([["Підтримка", "/contact"]])),
      title: `Підтримка: написати нам | ${BRAND}`,
      desc: "Напишіть у підтримку Iteris Code: ефекти й візуал, помилка в роботі сайту, ідея або побажання. Ми читаємо кожне звернення й відповімо на вашу пошту.",
    },
    {
      path: NEWS_PATH, kind: "info", active: "", crumbs: [[NEWS_TITLE, NEWS_PATH]], html: () => newsHtml(crumbsHtml([[NEWS_TITLE, NEWS_PATH]])),
      title: `${NEWS_TITLE} і що скоро: оновлення платформи | ${BRAND}`,
      desc: `Оновлення ${BRAND}: нові можливості й зміни за останні дні та плани. Скоро: монети, магазин і напарник-герой, що росте разом із вами.`,
    },
    {
      path: "/privacy", kind: "info", active: "", crumbs: [[PRIVACY_TITLE, "/privacy"]], html: () => legalHtml(PRIVACY_TITLE, "/privacy", PRIVACY_HTML),
      title: `${PRIVACY_TITLE} | ${BRAND}`,
      desc: `${BRAND}: які дані ми збираємо, навіщо, кому передаємо і як ви можете їх переглянути чи видалити.`,
    },
    {
      path: "/terms", kind: "info", active: "", crumbs: [[TERMS_TITLE, "/terms"]], html: () => legalHtml(TERMS_TITLE, "/terms", TERMS_HTML),
      title: `${TERMS_TITLE} | ${BRAND}`,
      desc: `Правила користування платформою ${BRAND}: акаунт, вік, безкоштовність, що заборонено, права на матеріали.`,
    },
  ];
  for (const [key, c] of Object.entries(CATS)) {
    pages.push({
      path: "/" + key, kind: "dir", active: "courses", crumbs: [["Курси", "/courses"], [c.title, "/" + key]], html: () => dirHtml(key),
      title: `${c.title}: довідник і курси | ${BRAND}`,
      desc: trim(`${c.title} українською: ${c.desc} Мови й технології: ${c.courses.map((k) => C[k].name).join(", ")}. Довідник без реєстрації.`),
    });
  }
  for (const [k, c] of Object.entries(C)) {
    pages.push({
      path: "/ref/" + k, kind: "ref", active: "courses",
      crumbs: [["Курси", "/courses"], [CATS[c.cat].title, "/" + c.cat], [c.name, "/ref/" + k]], html: (li) => refHtml(k, li),
      title: `${c.name}: довідник синтаксису українською | ${BRAND}`,
      desc: trim(`Довідник ${c.name} українською: ${(REF[k] ?? []).slice(0, 5).map((s) => s.t.toLowerCase()).join(", ")} та інше, з короткими прикладами коду.`),
    });
  }
  return pages;
}

const registry = new Map(publicPages().map((p) => [p.path, p] as const));

/** Публічна сторінка за адресою (з вхідною "/ref/js", "ref/js" чи ""), або undefined */
export function findPage(path: string): PageDef | undefined {
  const p = "/" + path.replace(/^\/+|\/+$/g, "");
  return registry.get(p);
}
