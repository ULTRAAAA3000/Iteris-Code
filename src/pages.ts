// Публічні сторінки сайту (доступні без входу): головна-лендинг, каталог курсів, «Як це працює», «Про проєкт», напрями й довідник мови.
// Модуль чистий (без DOM, мережі й входу): той самий HTML малює браузер, а збірка заздалегідь створює з нього готові сторінки для пошуковиків.
import { C, CATS, darkText, publicLessonTotal } from "./data.ts";
import { refSections } from "./i18n-ref.ts";
import { catDesc, catTitle, courseDesc, courseName } from "./i18n-data.ts";
import { cnt, getLang, inLang, l, setPublicMatcher, tr, type Lang } from "./i18n.ts";
import { contactHtml } from "./contact.ts";
import { demoHtml } from "./demo.ts";
import { NEWS_PATH, newsHtml, newsTitle } from "./changelog.ts";
import { privacyHtml, privacyTitle, termsHtml, termsTitle } from "./legal.ts";
import { esc } from "./util.ts";

export const BRAND = "Iteris Code";

export interface PageDef {
  /** Мова сторінки: для неї збірка робить окремий файл, а адреса має префікс /en */
  lang: Lang;
  /** Адреса без мовного префікса: "/", "/courses", "/ref/js" */
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
const sections = (k: string): number => refSections(k).length;
/** Текст у довіднику: `код` у зворотних апострофах стає <code> */
const inline = (s: string): string => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
const crumbsHtml = (items: readonly (readonly [string, string])[]): string =>
  `<nav class="crumbs" aria-label="${tr("Де ви", "You are here")}"><a href="${l("/")}">${tr("Головна", "Home")}</a>${items.map(([t, h], i) => ` / ${i === items.length - 1 ? `<span aria-current="page">${esc(t)}</span>` : `<a href="${l(h)}">${esc(t)}</a>`}`).join("")}</nav>`;

const nCourses = Object.keys(C).length;
const nLessons = publicLessonTotal();
const langNames = (): string[] => Object.keys(C).map(courseName);

/** Кнопка-заклик: гостю відкриває вхід, користувачу веде в кабінет */
const cta = (loggedIn: boolean, text = tr("Зареєструйся і вчись безкоштовно", "Sign up and learn for free")): string =>
  loggedIn ? `<a class="btn primary" href="/path">${tr("Продовжити навчання", "Continue learning")}</a>` : `<button class="btn primary" data-act="login">${text}</button>`;

/* ---------- Головна ---------- */

const faq = (): readonly (readonly [string, string])[] => tr<readonly (readonly [string, string])[]>([
  ["Це справді безкоштовно?", "Так. Довідник відкритий усім, а уроки, завдання й особистий кабінет безкоштовні для тих, хто увійшов. Платити не потрібно."],
  ["З чого почати, якщо я ніколи не програмував?", "Після входу оберіть мову й рівень «Новачок»: платформа поставить вас на початок шляху. Для першої мови добре підходять Python, JavaScript або Go."],
  ["Чи потрібно щось встановлювати?", "Ні. Редактор, термінал і перевірка працюють у браузері, у тому числі на телефоні. Код JavaScript виконується на вашому пристрої, код інших мов на сервері."],
  ["Як перевіряються завдання?", "Автоматично, без ШІ: платформа запускає ваш код і порівнює результат із вимогами. Ви бачите вивід програми й галочки за кожним пунктом: наприклад, «пройдено 2 з 3»."],
  ["Чи потрібна реєстрація, щоб користуватись довідником?", "Ні. Довідник по кожній мові відкритий без входу. Вхід потрібен для уроків, завдань, XP і збереження прогресу на всіх пристроях."],
  ["Чи можна вчитись із телефона?", "Так. Усі сторінки перевірено на екранах від 360 пікселів, а на телефоні замість важкого редактора відкривається простий."],
  ["Чи є проєкти за технічним завданням?", "Так. Ви отримуєте технічне завдання, складаєте невеликий продукт і бачите звіт «виконано X з N». Проєкти вже є в курсах JavaScript і Go (по три в Python, Java і Go), інші мови додаватимуться поступово."],
  ["Якою мовою уроки?", "Зараз усі уроки й завдання українською. Англійська версія готується: інтерфейс і публічні сторінки сайту вже доступні англійською, перемикач мови зверху."],
], [
  ["Is it really free?", "Yes. The reference is open to everyone, and lessons, tasks and your personal account are free for signed-in users. You never have to pay."],
  ["Where do I start if I have never programmed?", "After signing in, choose a language and the “Beginner” level: the platform puts you at the start of the path. Python, JavaScript or Go are good first languages."],
  ["Do I need to install anything?", "No. The editor, terminal and checking all work in the browser, including on a phone. JavaScript runs on your device, code in other languages runs on the server."],
  ["How are tasks checked?", "Automatically, without AI: the platform runs your code and compares the result with the requirements. You see the program output and a tick for every requirement, for example “2 of 3 passed”."],
  ["Do I need to register to use the reference?", "No. The reference for each language is open without signing in. You sign in for lessons, tasks, XP and saving progress across devices."],
  ["Can I learn from my phone?", "Yes. Every page is tested on screens from 360 pixels wide, and phones get a simple editor instead of the heavy one."],
  ["Are there projects based on a specification?", "Yes. You get a specification, build a small product and see a “done X of N” report. Projects already exist in the JavaScript and Go courses (three each in Python, Java and Go), and other languages will be added gradually."],
  ["What language are the lessons in?", "For now all lessons and tasks are in Ukrainian. An English version is on the way: the interface and the public pages of the site are already available in English, use the language switch at the top."],
]);

export const homeHtml = (loggedIn: boolean): string => `
  <section class="hero" aria-labelledby="h1">
    <div>
      <h1 id="h1">${tr("Вчися програмувати. Безкоштовно.", "Learn to code. For free.")}</h1>
      <p class="lead">${tr(`Уроки українською: читаєш, пишеш код у терміналі й одразу бачиш перевірку. ${nCourses} мов, ${nLessons} уроків, без встановлення програм.`, `You read, write code in the terminal and see the check straight away. ${nCourses} languages, ${nLessons} lessons, nothing to install. The lessons are in Ukrainian for now, an English version is on the way.`)}</p>
      <div class="actions">${cta(loggedIn)}<a class="btn" href="${l("/courses")}">${tr("Дивитись курси", "Browse courses")}</a></div>
      <p class="lp-note">${tr("Довідник по мовах відкритий усім, без входу.", "The language reference is open to everyone, no sign-in needed.")}</p>
    </div>
    <div class="sheet" aria-label="${tr("Спробуйте прямо тут", "Try it right here")}">
      <div class="tabs" role="tablist">
        <button role="tab" aria-selected="true" data-tab="p">Python</button>
        <button role="tab" aria-selected="false" data-tab="h">HTML</button>
      </div>
      <div class="pane" data-pane="p">
        <p class="hint">${tr("Введіть ім'я й запустіть програму.", "Enter a name and run the program.")}</p>
        <pre class="code">${tr(`name = input("Як тебе звати? ")
print("Привіт,", name + "!")`, `name = input("What is your name? ")
print("Hello,", name + "!")`)}</pre>
        <div class="field"><input type="text" id="pyname" value="${tr("Олена", "Alex")}" aria-label="${tr("Ваше ім'я", "Your name")}" maxlength="30"><button class="btn small" id="pyrun">${tr("Запустити", "Run")}</button></div>
        <div class="out" id="pyout" aria-live="polite"></div>
      </div>
      <div class="pane" data-pane="h" hidden>
        <p class="hint">${tr("Змініть текст заголовка: сторінка оновиться одразу.", "Change the heading text: the page updates instantly.")}</p>
        <pre class="code" id="htmlcode"></pre>
        <div class="field"><input type="text" id="htmlin" value="${tr("Мій перший сайт", "My first website")}" aria-label="${tr("Текст заголовка", "Heading text")}" maxlength="40"></div>
        <div class="out render" id="htmlout"></div>
      </div>
    </div>
  </section>

  ${demoHtml()}

  <section aria-labelledby="how">
    <h2 class="section-title" id="how">${tr("Як проходить навчання", "How learning works")}</h2>
    <p class="section-sub">${tr("Чотири кроки, які повторюються від теми до теми. Від теорії до коду, який працює.", "Four steps that repeat from topic to topic. From theory to code that works.")}</p>
    <ol class="lp-steps">
      <li class="lp-step">
        <span class="lp-n" aria-hidden="true">1</span>
        <h3>${tr("Читаєш урок", "You read a lesson")}</h3>
        <p>${tr("Коротке пояснення «простими словами», приклад коду й розділ «Як це в роботі».", "A short explanation “in plain words”, a code example and a “How it is used at work” section.")}</p>
        <div class="lp-viz" aria-hidden="true"><i class="ln w80"></i><i class="ln w60"></i><b class="cd">${tr('print("Привіт!")', 'print("Hello!")')}</b><i class="ln w70"></i></div>
      </li>
      <li class="lp-step">
        <span class="lp-n" aria-hidden="true">2</span>
        <h3>${tr("Пишеш код у терміналі", "You write code in the terminal")}</h3>
        <p>${tr("Міні-завдання одразу після теорії: редактор, кнопка «Запустити», вивід програми.", "A mini-task right after the theory: an editor, a “Run” button and the program output.")}</p>
        <div class="lp-viz lp-term" aria-hidden="true"><span class="cm">${tr("$ запустити", "$ run")}</span><span class="ok">${tr("✓ Виводить «Привіт, світе!»", "✓ Prints “Hello, world!”")}</span><span class="ok">${tr("✓ Без помилок", "✓ No errors")}</span><span class="no">${tr("✗ Додає ім'я користувача", "✗ Adds the user's name")}</span></div>
      </li>
      <li class="lp-step">
        <span class="lp-n" aria-hidden="true">3</span>
        <h3>${tr("Проєкт за ТЗ", "A project from a spec")}</h3>
        <p>${tr("Отримуєш технічне завдання й складаєш невеликий продукт, як у справжній роботі. Проєкти вже є в JavaScript, Python, Java і Go.", "You get a specification and build a small product, just like in real work. Projects already exist in JavaScript, Python, Java and Go.")}</p>
        <div class="lp-viz lp-spec" aria-hidden="true"><b>${tr("ТЗ: калькулятор знижок", "Spec: discount calculator")}</b><span>${tr("☐ Рахує суму", "☐ Adds up the total")}</span><span>${tr("☐ Застосовує промокод", "☐ Applies a promo code")}</span><span>${tr("☐ Показує чек", "☐ Shows a receipt")}</span></div>
      </li>
      <li class="lp-step">
        <span class="lp-n" aria-hidden="true">4</span>
        <h3>${tr("Автоматична перевірка", "Automatic checking")}</h3>
        <p>${tr("Тести без ШІ показують, що виконано, а що ні. Для міні-завдань це працює вже зараз.", "Tests without AI show what is done and what is not. For mini-tasks this works already.")}</p>
        <div class="lp-viz lp-report" aria-hidden="true"><b>${tr("Виконано 5 з 6", "Done 5 of 6")}</b><span class="bar"><i style="width:83%"></i></span></div>
      </li>
    </ol>
  </section>

  <section aria-labelledby="path">
    <h2 class="section-title" id="path">${tr("Свій шлях, без блокувань", "Your own path, no locks")}</h2>
    <p class="section-sub">${tr("Курс розбито на глави. Платформа підкаже, з чого почати за вашим рівнем, але будь-який урок можна відкрити будь-коли.", "A course is split into chapters. The platform suggests where to start for your level, but you can open any lesson at any time.")}</p>
    <div class="lp-path" role="img" aria-label="${tr("Приклад шляху: три глави з уроками, частина пройдена, один поточний", "Path example: three chapters of lessons, some completed and one in progress")}">
      <div class="lp-chap"><h3>${tr("Глава 1. Перші кроки", "Chapter 1. First steps")}</h3><div class="dots"><i class="d done"></i><i class="d done"></i><i class="d done"></i><i class="d done"></i></div><small>${tr("4 з 4", "4 of 4")}</small></div>
      <div class="lp-chap"><h3>${tr("Глава 2. Умови й цикли", "Chapter 2. Conditions and loops")}</h3><div class="dots"><i class="d done"></i><i class="d done"></i><i class="d now"><em>${tr("Ви тут", "You are here")}</em></i><i class="d"></i><i class="d"></i></div><small>${tr("2 з 5", "2 of 5")}</small></div>
      <div class="lp-chap"><h3>${tr("Глава 3. Функції", "Chapter 3. Functions")}</h3><div class="dots"><i class="d"></i><i class="d"></i><i class="d"></i><i class="d"></i></div><small>${tr("0 з 4", "0 of 4")}</small></div>
    </div>
  </section>

  <section class="lp-xp" aria-labelledby="xp">
    <div>
      <h2 class="section-title" id="xp" style="margin-top:72px">${tr("XP, рівні й серія днів", "XP, levels and day streaks")}</h2>
      <p class="section-sub">${tr("Кожен урок і завдання дають XP. Рівень росте разом з ними, а серія днів допомагає вчитись щодня, хоча б потроху.", "Every lesson and task gives you XP. Your level grows with it, and the day streak helps you study every day, even a little.")}</p>
      ${cta(loggedIn)}
    </div>
    <div class="card lp-xp-card" aria-hidden="true">
      <div class="lvl"><b>${tr("Рівень 3", "Level 3")}</b><span>140 XP</span></div>
      <div class="xp-bar"><i style="width:62%"></i></div>
      <div class="streak"><span class="fl">🔥</span><b>${tr("7 днів поспіль", "7 days in a row")}</b></div>
      <div class="lp-heat"><i class="l2"></i><i></i><i class="l1"></i><i class="l3"></i><i class="l2"></i><i class="l4"></i><i class="l1"></i><i class="l3"></i><i class="l2"></i><i></i><i class="l2"></i><i class="l4"></i><i class="l3"></i><i class="l1"></i></div>
    </div>
  </section>

  <section aria-labelledby="langs">
    <h2 class="section-title" id="langs">${tr(`${nCourses} мов і технологій`, `${nCourses} languages and technologies`)}</h2>
    <p class="section-sub">${tr("Оберіть мову, щоб відкрити довідник. Уроки й завдання чекають у кабінеті.", "Choose a language to open its reference. Lessons and tasks are waiting in your account.")}</p>
    <div class="ruled">
      ${Object.entries(CATS).map(([key, c]) => `
      <div class="dir">
        <div><h3><a href="${l("/" + key)}">${catTitle(key)}</a></h3><p>${catDesc(key)}</p></div>
        <div class="chips">${c.courses.map(chip).join("")}</div>
      </div>`).join("")}
    </div>
  </section>

  <section aria-labelledby="faq">
    <h2 class="section-title" id="faq">${tr("Часті запитання", "Frequently asked questions")}</h2>
    <div class="lp-faq">
      ${faq().map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}
    </div>
  </section>

  <section class="lp-cta" aria-labelledby="go">
    <h2 id="go">${tr("Готові почати?", "Ready to start?")}</h2>
    <p>${tr("Реєстрація безкоштовна. Перший урок займає кілька хвилин.", "Registration is free. The first lesson takes a few minutes.")}</p>
    ${cta(loggedIn)}
  </section>`;

const chip = (k: string): string => `<a class="chip" href="${l("/ref/" + k)}">${badge(k, "sm")}<span><b>${courseName(k)}</b><small>${tr("довідник", "reference")} · ${cnt(C[k].lessons, "lesson")}</small></span></a>`;

/* ---------- Каталог ---------- */

const catalogHtml = (loggedIn: boolean): string => `
  ${crumbsHtml([[tr("Курси", "Courses"), "/courses"]])}
  <h1 class="lp-h1">${tr("Курси програмування", "Programming courses")}</h1>
  <p class="section-sub">${tr(`${cnt(nCourses, "course")} і ${cnt(nLessons, "lesson")} українською. Довідник кожної мови відкритий усім, а уроки й завдання доступні після входу.`, `${cnt(nCourses, "course")} and ${cnt(nLessons, "lesson")}, currently in Ukrainian. The reference for each language is open to everyone, while lessons and tasks are available after you sign in.`)}</p>
  <div class="ruled">
    ${Object.entries(CATS).map(([key, c]) => `
    <div class="dir">
      <div><h2><a href="${l("/" + key)}">${catTitle(key)}</a></h2><p>${catDesc(key)}</p></div>
      <div class="chips">${c.courses.map(chip).join("")}</div>
    </div>`).join("")}
  </div>
  <section class="lp-cta"><h2>${tr("Уроки й завдання в кабінеті", "Lessons and tasks in your account")}</h2><p>${tr("Зареєструйтесь безкоштовно, оберіть мову й рівень, а платформа покаже, з чого почати.", "Sign up for free, choose a language and a level, and the platform will show you where to start.")}</p>${cta(loggedIn)}</section>`;

/* ---------- Як це працює ---------- */

const howHtml = (loggedIn: boolean): string => `
  ${crumbsHtml([[tr("Як це працює", "How it works"), "/how-it-works"]])}
  <h1 class="lp-h1">${tr("Як це працює", "How it works")}</h1>
  <p class="section-sub">${tr("Від першого уроку до практики: що ви побачите на платформі й навіщо кожен елемент.", "From the first lesson to practice: what you will see on the platform and what each part is for.")}</p>
  <div class="lp-article prose">
    <h2>${tr("1. Довідник і кабінет", "1. The reference and your account")}</h2>
    <p>${tr("<b>Довідник</b> відкритий усім. На сторінці кожної мови зібрано основні конструкції з короткими прикладами: зручно швидко згадати синтаксис.", "<b>The reference</b> is open to everyone. Each language page collects the main constructs with short examples, which makes it easy to refresh your memory of the syntax.")}</p>
    <p>${tr("<b>Кабінет</b> відкривається після входу. У ньому уроки по главах, завдання з перевіркою коду, прогрес, XP і серія днів.", "<b>Your account</b> opens after you sign in. It has lessons by chapter, tasks with code checking, your progress, XP and day streak.")}</p>
    <h2>${tr("2. Свій шлях", "2. Your own path")}</h2>
    <p>${tr("Після входу ви обираєте мову й рівень: новачок, середній або впевнений. Платформа ставить вас у відповідне місце шляху. Блокувань немає: будь-який урок відкривається в будь-який момент.", "After signing in you choose a language and a level: beginner, intermediate or confident. The platform places you at the matching point of the path. There are no locks: any lesson opens at any moment.")}</p>
    <h2>${tr("3. Урок у єдиному форматі", "3. A lesson in one format")}</h2>
    <ul>
      <li>${tr("<b>Простими словами:</b> коротка аналогія замість сухого визначення.", "<b>In plain words:</b> a short analogy instead of a dry definition.")}</li>
      <li>${tr("<b>Пояснення й приклад коду:</b> те, що можна скопіювати й запустити.", "<b>Explanation and a code example:</b> something you can copy and run.")}</li>
      <li>${tr("<b>Запам'ятайте:</b> головна думка уроку в одному реченні.", "<b>Remember:</b> the main idea of the lesson in one sentence.")}</li>
      <li>${tr("<b>Як це в роботі:</b> де ця тема трапляється в реальних проєктах.", "<b>How it is used at work:</b> where this topic appears in real projects.")}</li>
      <li>${tr("<b>Самоперевірка:</b> кілька завдань, щоб закріпити матеріал.", "<b>Self-check:</b> a few tasks to reinforce the material.")}</li>
    </ul>
    <h2>${tr("4. Міні-завдання в терміналі", "4. Mini-tasks in the terminal")}</h2>
    <p>${tr("Після теорії ви пишете код у редакторі й натискаєте «Запустити». Термінал показує вивід вашої програми та галочку чи хрестик за кожною вимогою. Перевірка автоматична, без ШІ.", "After the theory you write code in the editor and press “Run”. The terminal shows your program's output and a tick or a cross for every requirement. The check is automatic, without AI.")}</p>
    <p>${tr("Практичні завдання вже є в курсах JavaScript, Python, Go і C++ (по завданню до кожного уроку). Інші мови додаються поступово. Код JavaScript виконується на вашому пристрої, код інших мов безпечно запускається на сервері.", "Practical tasks already exist in the JavaScript, Python, Go and C++ courses (a task for every lesson). Other languages are being added gradually. JavaScript runs on your device, while code in other languages runs safely on the server.")}</p>
    <h2>${tr("5. XP, рівні та серія днів", "5. XP, levels and day streaks")}</h2>
    <p>${tr("За кожен урок і завдання ви отримуєте XP. Вони не витрачаються: це показник вашого прогресу, від якого залежить рівень. Серія днів показує, скільки днів поспіль ви вчились, а календар активності зберігає, що саме ви проходили. День рахується за часом UTC.", "You earn XP for every lesson and task. It is never spent: it is a measure of your progress that determines your level. The day streak shows how many days in a row you studied, and the activity calendar records what exactly you went through. A day is counted in UTC time.")}</p>
    <h2>${tr("6. Проєкти за технічним завданням", "6. Projects from a specification")}</h2>
    <p>${tr("Ви отримуєте ТЗ, складаєте невеликий продукт і бачите звіт «виконано X з Y». Кожну вимогу перевіряють автоматичні тести, без ШІ. Проєкти вже є в курсах JavaScript (список справ), Python, Java і Go (по три, код запускається на сервері), інші мови додаватимуться поступово.", "You get a specification, build a small product and see a “done X of Y” report. Every requirement is checked by automatic tests, without AI. Projects already exist in the JavaScript (a to-do list), Python, Java and Go courses (three each, the code runs on the server), and other languages will be added gradually.")}</p>
  </div>
  <section class="lp-cta"><h2>${tr("Спробуйте самі", "Try it yourself")}</h2><p>${tr("Це безкоштовно. Оберіть мову й пройдіть перший урок.", "It is free. Choose a language and take the first lesson.")}</p>${cta(loggedIn)}</section>`;

/* ---------- Про проєкт ---------- */

const aboutHtml = (loggedIn: boolean): string => `
  ${crumbsHtml([[tr("Про проєкт", "About"), "/about"]])}
  <h1 class="lp-h1">${tr("Про проєкт", "About the project")}</h1>
  <p class="section-sub">${tr(`${BRAND} — безкоштовна платформа, де можна вивчити мову програмування так, щоб потім працювати.`, `${BRAND} is a free platform where you can learn a programming language well enough to work with it afterwards.`)}</p>
  <div class="lp-article prose">
    <h2>${tr("Для чого це потрібно", "Why it exists")}</h2>
    <p>${tr("Багато курсів закінчуються на теорії й абстрактних задачах. Ми робимо навпаки: кожен урок показує, як тема виглядає в реальному проєкті, а практика наближається до справжньої роботи: отримуєш завдання й робиш невеликий продукт.", "Many courses end with theory and abstract exercises. We do the opposite: every lesson shows what the topic looks like in a real project, and the practice gets close to real work: you receive a task and build a small product.")}</p>
    <h2>${tr("Принципи", "Principles")}</h2>
    <ul>
      <li>${tr("<b>Безкоштовно.</b> Платформа не вимагає оплати, щоб вчитись.", "<b>Free.</b> The platform never asks for payment to learn.")}</li>
      <li>${tr("<b>Робота, а не оцінки.</b> Мета: навчитись так, щоб можна було працювати.", "<b>Work, not grades.</b> The goal is to learn well enough to be able to work.")}</li>
      <li>${tr("<b>Практика після теорії.</b> Спершу пояснення, одразу після нього код.", "<b>Practice after theory.</b> First an explanation, then code right after it.")}</li>
      <li>${tr("<b>Вільний шлях.</b> Будь-який урок доступний у будь-який момент.", "<b>A free path.</b> Any lesson is available at any moment.")}</li>
      <li>${tr("<b>Без ШІ-перевірок.</b> Завдання перевіряються автоматичними тестами за зрозумілими вимогами.", "<b>No AI grading.</b> Tasks are checked by automatic tests against clear requirements.")}</li>
      <li>${tr("<b>Простота.</b> Короткі пояснення, зрозумілі аналогії, код блоками.", "<b>Simplicity.</b> Short explanations, clear analogies, code in blocks.")}</li>
    </ul>
    <h2>${tr("Що всередині", "What is inside")}</h2>
    <p>${tr(`${cnt(nCourses, "course")}: ${langNames().join(", ")}. Разом ${cnt(nLessons, "lesson")}, розбитих на глави, і довідник по кожній мові. Сайт працює на телефоні.`, `${cnt(nCourses, "course")}: ${langNames().join(", ")}. In total ${cnt(nLessons, "lesson")} split into chapters, plus a reference for every language. The site works on a phone. The lessons are in Ukrainian for now.`)}</p>
    <h2>${tr("Технології", "Technology")}</h2>
    <p>${tr("Сайт написаний на TypeScript і працює на Cloudflare.", "The site is written in TypeScript and runs on Cloudflare.")}</p>
  </div>
  <section class="lp-cta"><h2>${tr("Почніть вчитись", "Start learning")}</h2><p>${tr("Реєстрація безкоштовна.", "Registration is free.")}</p>${cta(loggedIn)}</section>`;

/* ---------- Політика й умови ---------- */

const legalHtml = (title: string, path: string, body: string): string => `
  ${crumbsHtml([[title, path]])}
  <h1 class="lp-h1">${title}</h1>
  <div class="lp-article prose legal">${body}</div>`;

/* ---------- Напрям і довідник мови ---------- */

function dirHtml(key: string): string {
  const c = CATS[key];
  return `
  ${crumbsHtml([[tr("Курси", "Courses"), "/courses"], [catTitle(key), "/" + key]])}
  <h1 class="lp-h1">${catTitle(key)}</h1>
  <p class="section-sub" style="margin-bottom:32px">${catDesc(key)}</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:24px">
    ${c.courses.map((k) => {
      const x = C[k];
      return `<a class="card" href="${l("/ref/" + k)}" style="text-decoration:none;display:grid;gap:14px;border-top:10px solid ${x.color}">
        <div style="display:flex;gap:14px;align-items:center">${badge(k)}<h2 style="font-size:1.6rem">${courseName(k)}</h2></div>
        <p style="margin:0">${courseDesc(k)}</p>
        <small style="color:var(--muted)">${tr("Довідник", "Reference")}: ${cnt(sections(k), "section")} · ${cnt(x.lessons, "lesson")} ${tr("у кабінеті", "in your account")}${x.base ? tr(` (${x.base} базових і ${x.lessons - x.base} просунутих)`, ` (${x.base} core and ${x.lessons - x.base} advanced)`) : ""}</small>
      </a>`;
    }).join("")}
  </div>`;
}

function refHtml(k: string, loggedIn: boolean): string {
  const c = C[k], secs = refSections(k);
  return `
  ${crumbsHtml([[tr("Курси", "Courses"), "/courses"], [catTitle(c.cat), "/" + c.cat], [courseName(k), "/ref/" + k]])}
  <div class="course-head">${badge(k)}<div><h1>${courseName(k)}: ${tr("довідник", "reference")}</h1><p>${courseDesc(k)}</p></div></div>
  <nav class="callout" aria-label="${tr("Розділи довідника", "Reference sections")}"><b>${tr("Розділи.", "Sections.")}</b> ${secs.map((s, i) => `<a href="#s${i}">${esc(s.t)}</a>`).join(" · ")}</nav>
  <div class="prose ref">
    ${secs.map((s, i) => `<section id="s${i}"><h2>${esc(s.t)}</h2>
      ${s.items.map((x) => `<h3>${esc(x.t)}</h3>${x.note ? `<p>${inline(x.note)}</p>` : ""}<pre class="code">${esc(x.code)}</pre>`).join("")}</section>`).join("")}
  </div>
  <div class="callout"><b>${tr("Хочете вчитися крок за кроком?", "Want to learn step by step?")}</b> ${tr(`У кабінеті є ${cnt(c.lessons, "lesson")} по главах${c.base ? ` (${c.base} базових і ${c.lessons - c.base} просунутих, рівень можна перемикати в будь-який момент)` : ""} і завдання з перевіркою коду.`, `Your account has ${cnt(c.lessons, "lesson")} organised by chapter${c.base ? ` (${c.base} core and ${c.lessons - c.base} advanced, you can switch the level at any time)` : ""} and tasks with code checking.`)} ${loggedIn ? `<a href="/path/${k}">${tr(`Відкрити курс ${esc(courseName(k))}`, `Open the ${esc(courseName(k))} course`)}</a>` : `<button class="btn small" data-act="login">${tr("Увійти й почати", "Sign in and start")}</button>`}</div>`;
}

/* ---------- Реєстр сторінок ---------- */

const trim = (s: string, n = 158): string => (s.length <= n ? s : s.slice(0, n - 1).replace(/[\s,;:.]+\S*$/, "") + "…");

function buildPages(lang: Lang): PageDef[] {
  const T = tr;
  const base = { lang } as const;
  const pages: PageDef[] = [
    {
      ...base, path: "/", kind: "home", active: "home", crumbs: [], faq: faq(), html: homeHtml,
      title: T(`${BRAND}: вчися програмувати безкоштовно українською`, `${BRAND}: learn to code for free`),
      desc: trim(T(`Безкоштовні уроки програмування українською: ${langNames().slice(0, 8).join(", ")} та інші. Читай урок, пиши код у терміналі, отримуй перевірку й XP.`, `Free programming lessons: ${langNames().slice(0, 8).join(", ")} and more. Read a lesson, write code in the terminal, get checked and earn XP. The lessons are in Ukrainian for now.`)),
    },
    {
      ...base, path: "/courses", kind: "catalog", active: "courses", crumbs: [[T("Курси", "Courses"), "/courses"]], html: catalogHtml,
      title: T(`Курси програмування: ${nCourses} мов, ${nLessons} уроків | ${BRAND}`, `Programming courses: ${nCourses} languages, ${nLessons} lessons | ${BRAND}`),
      desc: trim(T(`${cnt(nCourses, "course")}: ${langNames().join(", ")}. Довідник без реєстрації, уроки й завдання з перевіркою коду безкоштовно.`, `${cnt(nCourses, "course")}: ${langNames().join(", ")}. A reference without sign-up, lessons and code-checked tasks for free.`)),
    },
    {
      ...base, path: "/how-it-works", kind: "info", active: "how", crumbs: [[T("Як це працює", "How it works"), "/how-it-works"]], html: howHtml,
      title: T(`Як це працює: уроки, термінал, XP | ${BRAND}`, `How it works: lessons, terminal, XP | ${BRAND}`),
      desc: T("Як проходить навчання: урок простими словами, міні-завдання в терміналі з автоматичною перевіркою, свій шлях без блокувань, XP, рівні та серія днів.", "How learning works: a lesson in plain words, a mini-task in the terminal with automatic checking, your own path without locks, XP, levels and day streaks."),
    },
    {
      ...base, path: "/about", kind: "info", active: "about", crumbs: [[T("Про проєкт", "About"), "/about"]], html: aboutHtml,
      title: T(`Про проєкт | ${BRAND}`, `About | ${BRAND}`),
      desc: T(`${BRAND}: безкоштовна платформа, де можна вивчити мову програмування так, щоб працювати. Принципи, зміст курсів і технології.`, `${BRAND}: a free platform for learning a programming language well enough to work with it. Principles, course content and technology.`),
    },
    {
      ...base, path: "/contact", kind: "info", active: "contact", crumbs: [[T("Підтримка", "Support"), "/contact"]], html: () => contactHtml(crumbsHtml([[T("Підтримка", "Support"), "/contact"]])),
      title: T(`Підтримка: написати нам | ${BRAND}`, `Support: write to us | ${BRAND}`),
      desc: T("Напишіть у підтримку Iteris Code: ефекти й візуал, помилка в роботі сайту, ідея або побажання. Ми читаємо кожне звернення й відповімо на вашу пошту.", "Write to Iteris Code support: effects and visuals, a bug on the site, an idea or a wish. We read every message and will reply to your email."),
    },
    {
      ...base, path: NEWS_PATH, kind: "info", active: "", crumbs: [[newsTitle(), NEWS_PATH]], html: () => newsHtml(crumbsHtml([[newsTitle(), NEWS_PATH]])),
      title: T(`${newsTitle()} і що скоро: оновлення платформи | ${BRAND}`, `${newsTitle()} and what is coming: platform updates | ${BRAND}`),
      desc: T(`Оновлення ${BRAND}: нові можливості й зміни за останні дні та плани. Скоро: монети, магазин і напарник-герой, що росте разом із вами.`, `${BRAND} updates: new features and changes from recent days, plus plans. Coming soon: coins, a shop and a companion hero that grows with you.`),
    },
    {
      ...base, path: "/privacy", kind: "info", active: "", crumbs: [[privacyTitle(), "/privacy"]], html: () => legalHtml(privacyTitle(), "/privacy", privacyHtml()),
      title: `${privacyTitle()} | ${BRAND}`,
      desc: T(`${BRAND}: які дані ми збираємо, навіщо, кому передаємо і як ви можете їх переглянути чи видалити.`, `${BRAND}: what data we collect, why, who we share it with and how you can view or delete it.`),
    },
    {
      ...base, path: "/terms", kind: "info", active: "", crumbs: [[termsTitle(), "/terms"]], html: () => legalHtml(termsTitle(), "/terms", termsHtml()),
      title: `${termsTitle()} | ${BRAND}`,
      desc: T(`Правила користування платформою ${BRAND}: акаунт, вік, безкоштовність, що заборонено, права на матеріали.`, `Rules for using the ${BRAND} platform: account, age, free access, what is prohibited, rights to materials.`),
    },
  ];
  for (const [key, c] of Object.entries(CATS)) {
    pages.push({
      ...base, path: "/" + key, kind: "dir", active: "courses", crumbs: [[T("Курси", "Courses"), "/courses"], [catTitle(key), "/" + key]], html: () => dirHtml(key),
      title: T(`${catTitle(key)}: довідник і курси | ${BRAND}`, `${catTitle(key)}: reference and courses | ${BRAND}`),
      desc: trim(T(`${catTitle(key)} українською: ${catDesc(key)} Мови й технології: ${c.courses.map(courseName).join(", ")}. Довідник без реєстрації.`, `${catTitle(key)}: ${catDesc(key)} Languages and technologies: ${c.courses.map(courseName).join(", ")}. Reference without sign-up.`)),
    });
  }
  for (const [k, c] of Object.entries(C)) {
    pages.push({
      ...base, path: "/ref/" + k, kind: "ref", active: "courses",
      crumbs: [[T("Курси", "Courses"), "/courses"], [catTitle(c.cat), "/" + c.cat], [courseName(k), "/ref/" + k]], html: (li) => refHtml(k, li),
      title: T(`${courseName(k)}: довідник синтаксису українською | ${BRAND}`, `${courseName(k)}: syntax reference | ${BRAND}`),
      desc: trim(T(`Довідник ${courseName(k)} українською: ${refSections(k).slice(0, 5).map((s) => s.t.toLowerCase()).join(", ")} та інше, з короткими прикладами коду.`, `${courseName(k)} reference: ${refSections(k).slice(0, 5).map((s) => s.t.toLowerCase()).join(", ")} and more, with short code examples.`)),
    });
  }
  return pages;
}

/** Усі публічні сторінки однієї мови: з цього списку працює браузер і збірка (готові сторінки, sitemap). html() малює сторінку тією мовою, для якої її створено */
export function publicPages(lang: Lang = getLang()): PageDef[] {
  return inLang(lang, () => buildPages(lang)).map((p) => ({ ...p, html: (li: boolean) => inLang(lang, () => p.html(li)) }));
}

const registries = new Map<Lang, Map<string, PageDef>>();
const registry = (lang: Lang): Map<string, PageDef> => {
  let r = registries.get(lang);
  if (!r) { r = new Map(publicPages(lang).map((p) => [p.path, p] as const)); registries.set(lang, r); }
  return r;
};
setPublicMatcher((path) => registry("uk").has(path));

/** Публічна сторінка за адресою без мовного префікса ("/ref/js", "ref/js" чи ""), або undefined */
export function findPage(path: string, lang: Lang = getLang()): PageDef | undefined {
  const p = "/" + path.replace(/^\/+|\/+$/g, "");
  return registry(lang).get(p);
}
