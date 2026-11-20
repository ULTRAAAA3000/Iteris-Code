// Чернетки проєктів за ТЗ для курсу HTML (сторінка в iframe без скриптів, перевірка за DOM). НЕ ПУБЛІКУЮТЬСЯ.
// Еталони й мутації для перевірки вимог: tests/solutions/drafts-html.mjs. Правила: Documentation/spec-drafts.md
import type { PageDraft } from "./types.ts";

const raw = String.raw;

export const HTML_DRAFTS: readonly PageDraft[] = [
  {
    id: "html-signup-form", course: "html", runtime: "page", xp: 50,
    after: "html/7", needs: ["форми", "типи полів", "label і id", "атрибути валідації", "fieldset і legend", "select, radio, checkbox, textarea"],
    title: "Проєкт: форма запису на курс",
    context: "Форма реєстрації є майже на кожному сайті. Добре зроблена форма підказує браузеру, що вводити (автозаповнення, клавіатура на телефоні), сама перевіряє дані й зрозуміла для скрінрідера. І все це без жодного рядка JavaScript.",
    brief: [
      "Створіть сторінку «Запис на курс» з однією формою. Для людини вона має бути зручною (правильна клавіатура, автозаповнення, підказки), а для браузера перевірюваною: обов'язкові поля, довжини, шаблон телефону.",
      "Усі поля пов'язуйте з підписами через <code>for</code> та <code>id</code>, групи полів об'єднуйте через <code>fieldset</code> із <code>legend</code>.",
    ],
    contract: [
      "форма: <code>action=\"/enroll\"</code>, <code>method=\"post\"</code>, без <code>novalidate</code>",
      "поля й їхні <code>id</code>: <code>fullname</code>, <code>email</code>, <code>phone</code>, <code>birth</code>, <code>hours</code>, <code>level</code>, <code>comment</code>, <code>agree</code>",
      "радіокнопки мають <code>name=\"format\"</code> і значення <code>online</code> та <code>offline</code>",
      "кнопка надсилання з написом «Записатися»",
    ],
    mockup: [
      "Запис на курс",
      "┌─ Особисті дані ────────────────────────┐",
      "│ Ім'я та прізвище  [ ____________ ]     │",
      "│ Електронна пошта  [ ____________ ]     │",
      "│ Телефон           [ +380________ ]     │",
      "│ Дата народження   [ дд.мм.рррр ]       │",
      "└────────────────────────────────────────┘",
      "Рівень підготовки   [ Оберіть рівень ▾ ]",
      "┌─ Формат навчання ──────────────────────┐",
      "│ (•) Онлайн   ( ) Офлайн                │",
      "└────────────────────────────────────────┘",
      "Годин на тиждень    [ 5 ]",
      "Побажання           [ багаторядкове поле ]",
      "[✓] Погоджуюсь з правилами курсу",
      "[ Записатися ]",
    ].join("\n"),
    starter: raw`<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <title>Запис на курс</title>
</head>
<body>
  <h1>Запис на курс</h1>
  <!-- TODO: форма за ТЗ -->
  Ім'я та прізвище
  Електронна пошта
  Телефон
</body>
</html>
`,
    requirements: [
      { id: "R1", short: "Форма: action, method і заголовок сторінки", text: "Є форма з <code>action=\"/enroll\"</code> і <code>method=\"post\"</code>, без <code>novalidate</code>; на сторінці один заголовок <code>h1</code> «Запис на курс».",
        hint: "Атрибут <code>novalidate</code> вимикає вбудовану перевірку браузера, а вона нам потрібна.",
        checks: [
          { selector: "form", attr: { name: "action", equals: "/enroll" } },
          { selector: "form", attr: { name: "method", equals: "post" } },
          { selector: "form[novalidate]", not: true },
          { selector: "h1", text: "Запис на курс", count: 1 },
        ] },
      { id: "R2", short: "Група «Особисті дані»: fieldset і legend", text: "Ім'я, пошта, телефон і дата народження зібрані у <code>fieldset</code> із <code>legend</code> «Особисті дані».",
        hint: "<code>legend</code> має бути першим дочірнім елементом <code>fieldset</code>.",
        checks: [
          { selector: "form fieldset > legend", text: "Особисті дані" },
          { selector: "fieldset:first-of-type input", count: { min: 4 } },
        ] },
      { id: "R3", short: "Ім'я: text, required, minlength 2, autocomplete", text: "Поле <code>#fullname</code>: тип <code>text</code>, обов'язкове, мінімум 2 символи, <code>autocomplete=\"name\"</code>.",
        hint: "Атрибути <code>required</code>, <code>minlength</code> і <code>autocomplete</code> роблять роботу без JavaScript.",
        checks: [
          { selector: "input#fullname[type=\"text\"][required]" },
          { selector: "input#fullname", attr: { name: "minlength", equals: "2" } },
          { selector: "input#fullname", attr: { name: "autocomplete", equals: "name" } },
        ] },
      { id: "R4", short: "Пошта (email) і телефон (tel із шаблоном)", text: "<code>#email</code> має тип <code>email</code> і обов'язковий; <code>#phone</code> має тип <code>tel</code>, шаблон <code>pattern</code> для номера <code>+380XXXXXXXXX</code> і пояснення <code>title</code>.",
        hint: "Шаблон записується регулярним виразом: <code>\\+380\\d{9}</code>. Без <code>title</code> користувач не знатиме, який формат очікується.",
        checks: [
          { selector: "input#email[type=\"email\"][required]" },
          { selector: "input#email", attr: { name: "autocomplete", equals: "email" } },
          { selector: "input#phone[type=\"tel\"]" },
          { selector: "input#phone", attr: { name: "pattern", has: "380" } },
          { selector: "input#phone[title]" },
        ] },
      { id: "R5", short: "Дата народження (date) і години (number 1–20)", text: "<code>#birth</code> має тип <code>date</code>; <code>#hours</code> має тип <code>number</code> з межами від 1 до 20.",
        hint: "Для числа з межами потрібні атрибути <code>min</code> і <code>max</code>.",
        checks: [
          { selector: "input#birth[type=\"date\"]" },
          { selector: "input#hours[type=\"number\"]", attr: { name: "min", equals: "1" } },
          { selector: "input#hours", attr: { name: "max", equals: "20" } },
        ] },
      { id: "R6", short: "Кожне поле пов'язане з підписом label", text: "Для кожного з полів <code>fullname</code>, <code>email</code>, <code>phone</code>, <code>birth</code>, <code>hours</code>, <code>level</code>, <code>comment</code> є <code>label</code> із <code>for</code>, що збігається з <code>id</code>.",
        hint: "Підпис <code>&lt;label for=\"email\"&gt;</code> зв'язується з полем <code>&lt;input id=\"email\"&gt;</code>. Клік по підпису тоді ставить курсор у поле.",
        checks: ["fullname", "email", "phone", "birth", "hours", "level", "comment"].map((id) => ({ selector: `label[for="${id}"]` })) },
      { id: "R7", short: "Рівень підготовки: select із підказкою", text: "<code>select#level</code> з іменем <code>level</code> має щонайменше чотири пункти; перший порожній, вимкнений і вибраний за замовчуванням (підказка «Оберіть рівень»).",
        hint: "Перший пункт: <code>&lt;option value=\"\" disabled selected&gt;</code>. Так користувач мусить зробити вибір сам.",
        checks: [
          { selector: "select#level[name=\"level\"]" },
          { selector: "select#level option", count: { min: 4 } },
          { selector: "select#level option[value=\"\"][disabled][selected]" },
        ] },
      { id: "R8", short: "Формат: дві радіокнопки в fieldset", text: "У <code>fieldset</code> із <code>legend</code> «Формат навчання» дві радіокнопки з одним <code>name=\"format\"</code> (<code>online</code>, <code>offline</code>); одна вибрана за замовчуванням.",
        hint: "Радіокнопки одного вибору мають однаковий <code>name</code>: так браузер дозволяє обрати лише одну.",
        checks: [
          { selector: "fieldset > legend", text: "Формат навчання" },
          { selector: "input[type=\"radio\"][name=\"format\"]", count: 2 },
          { selector: "input[type=\"radio\"][name=\"format\"]", attr: { name: "value", equals: "online" } },
          { selector: "input[type=\"radio\"][name=\"format\"]", attr: { name: "value", equals: "offline" } },
          { selector: "input[type=\"radio\"][name=\"format\"][checked]", count: 1 },
        ] },
      { id: "R9", short: "Згода (checkbox, required) і побажання (textarea)", text: "Прапорець <code>#agree</code> обов'язковий, а його підпис містить «Погоджуюсь»; <code>textarea#comment</code> має <code>rows</code> і обмеження довжини <code>maxlength</code>.",
        hint: "Для підпису прапорця теж потрібен <code>label for=\"agree\"</code>.",
        checks: [
          { selector: "input#agree[type=\"checkbox\"][required]" },
          { selector: "label[for=\"agree\"]", text: "Погоджуюсь" },
          { selector: "textarea#comment[name=\"comment\"][rows][maxlength]" },
        ] },
      { id: "R10", short: "Кнопка «Записатися» і порядок без зайвого", text: "Є кнопка <code>button</code> типу <code>submit</code> з написом «Записатися»; жодне текстове поле не лишилось без <code>id</code>.",
        hint: "Явний <code>type=\"submit\"</code> робить поведінку кнопки очевидною.",
        checks: [
          { selector: "button[type=\"submit\"]", text: "Записатися" },
          { selector: "input:not([type=\"submit\"]):not([type=\"radio\"]):not([id])", not: true },
        ] },
    ],
  },
  {
    id: "html-cafe-menu", course: "html", runtime: "page", xp: 50,
    after: "html/8", needs: ["заголовки й списки", "посилання (якорі, tel, mailto)", "зображення з alt", "таблиці", "семантичні теги", "address, figure"],
    title: "Проєкт: сторінка меню кафе",
    context: "Сторінка меню — класичний приклад «контентного» сайту: заголовки, списки, таблиця цін, фото, контакти. Саме так читають її люди, пошукові системи й скрінрідери, тому структура важливіша за вигляд.",
    brief: [
      "Зверстайте одну сторінку меню кафе «Лаванда» за схемою нижче. Лише HTML, без стилів: головне — правильна структура й семантика.",
      "Зображенню дайте змістовний <code>alt</code> і розміри <code>width</code>/<code>height</code> (файл може бути вигаданий: <code>src=\"cake.jpg\"</code>).",
    ],
    contract: [
      "<code>h1</code> «Кафе «Лаванда»» у <code>header</code> разом із навігацією <code>nav</code>",
      "три розділи <code>section</code> з якорями <code>#coffee</code>, <code>#desserts</code>, <code>#contacts</code> і заголовками «Кава», «Десерти», «Контакти»",
      "таблиця цін з підписом, чотири напої, ціни у форматі «45 грн»",
      "контакти в <code>address</code>",
    ],
    mockup: [
      "Кафе «Лаванда»      [Кава] [Десерти] [Контакти]",
      "──────────────────────────────────────────",
      "Кава",
      "  Напій           Об'єм    Ціна",
      "  Еспресо         30 мл    45 грн",
      "  Американо       200 мл   55 грн",
      "  Капучино        250 мл   75 грн",
      "  Лавандовий раф  300 мл   95 грн",
      "Десерти",
      "  • Чизкейк — опис (усього 4 пункти, назва жирним)",
      "  [ фото + підпис ]",
      "Контакти",
      "  адреса, телефон, пошта, посилання на мапу",
      "© 2026 Кафе «Лаванда»",
    ].join("\n"),
    starter: raw`<!DOCTYPE html>
<html>
<head>
  <title>Меню</title>
</head>
<body>
  <div>Кафе «Лаванда»</div>
  <div>Кава: еспресо 45 грн, американо 55 грн</div>
  <div>Десерти: чизкейк</div>
  <div>вул. Лавандова, 5, Дніпро, +38 056 123 45 67</div>
</body>
</html>
`,
    requirements: [
      { id: "R1", short: "Скелет документа: doctype, lang, charset, title, viewport", text: "Оголошено <code>&lt;!DOCTYPE html&gt;</code>, мову <code>lang=\"uk\"</code>, кодування UTF-8, <code>viewport</code> і заголовок вкладки «Меню кафе «Лаванда»».",
        hint: "Усе це живе в <code>&lt;html&gt;</code> і <code>&lt;head&gt;</code>. Заголовок вкладки: <code>&lt;title&gt;Меню кафе «Лаванда»&lt;/title&gt;</code>.",
        checks: [
          { source: { matches: "<!(?:DOCTYPE|doctype) html>" } },
          { selector: "html", attr: { name: "lang", equals: "uk" } },
          { selector: "head > meta[charset]", attr: { name: "charset", matches: "^[Uu][Tt][Ff]-8$" } },
          { selector: "head > meta[name=\"viewport\"]" },
          { selector: "head > title", text: "Меню кафе «Лаванда»" },
        ] },
      { id: "R2", short: "Шапка: h1 і навігація з трьома якорями", text: "У <code>header</code> є <code>h1</code> «Кафе «Лаванда»» і <code>nav</code> (з <code>aria-label</code>) зі списком із трьох посилань на <code>#coffee</code>, <code>#desserts</code>, <code>#contacts</code>.",
        hint: "Навігацію зручно робити списком: <code>nav &gt; ul &gt; li &gt; a</code>. Підпис навігації: <code>aria-label=\"Розділи меню\"</code>.",
        checks: [
          { selector: "body > header h1", text: "Кафе «Лаванда»", count: 1 },
          { selector: "header nav[aria-label] ul > li > a", count: 3 },
          { selector: "nav a", attr: { name: "href", equals: "#coffee" } },
          { selector: "nav a", attr: { name: "href", equals: "#desserts" } },
          { selector: "nav a", attr: { name: "href", equals: "#contacts" } },
        ] },
      { id: "R3", short: "Три розділи section з id і заголовками h2", text: "У <code>main</code> три <code>section</code> з <code>id</code> <code>coffee</code>, <code>desserts</code>, <code>contacts</code>; кожен починається заголовком <code>h2</code> («Кава», «Десерти», «Контакти»).",
        hint: "Якір <code>#coffee</code> веде на елемент з <code>id=\"coffee\"</code>.",
        checks: [
          { selector: "main > section#coffee > h2", text: "Кава" },
          { selector: "main > section#desserts > h2", text: "Десерти" },
          { selector: "main > section#contacts > h2", text: "Контакти" },
        ] },
      { id: "R4", short: "Таблиця цін: caption, thead зі scope, 4 рядки", text: "У розділі «Кава» таблиця з <code>caption</code>, заголовками стовпців <code>th scope=\"col\"</code> (три), чотирма рядками в <code>tbody</code>; останній стовпець містить ціну з «грн».",
        hint: "Структура: <code>table &gt; caption</code>, <code>thead &gt; tr &gt; th</code>, <code>tbody &gt; tr &gt; td</code>.",
        checks: [
          { selector: "#coffee table > caption" },
          { selector: "#coffee table > thead > tr > th", attr: { name: "scope", equals: "col" }, count: 3 },
          { selector: "#coffee table > tbody > tr", count: 4 },
          { selector: "#coffee tbody td:last-child", text: "грн", count: 4 },
        ] },
      { id: "R5", short: "Десерти: список із чотирьох пунктів, назва в strong", text: "У розділі «Десерти» маркований список із чотирьох пунктів; у кожному назва десерту виділена <code>strong</code>.",
        hint: "Один пункт: <code>&lt;li&gt;&lt;strong&gt;Чизкейк&lt;/strong&gt; — опис&lt;/li&gt;</code>.",
        checks: [
          { selector: "#desserts ul > li", count: 4 },
          { selector: "#desserts ul > li > strong", count: 4 },
        ] },
      { id: "R6", short: "Фото в figure: alt, width, height і figcaption", text: "У розділі «Десерти» є <code>figure</code> із зображенням (змістовний <code>alt</code> від 10 символів, <code>width</code> і <code>height</code>) та підписом <code>figcaption</code>.",
        hint: "<code>alt</code> описує, що на фото, а не «картинка». Розміри допомагають не «стрибати» сторінці під час завантаження.",
        checks: [
          { selector: "#desserts figure > img", attr: { name: "alt", matches: "^.{10,}$" } },
          { selector: "#desserts figure > img", attr: { name: "width", matches: "^\\d+$" } },
          { selector: "#desserts figure > img", attr: { name: "height", matches: "^\\d+$" } },
          { selector: "#desserts figure > figcaption" },
        ] },
      { id: "R7", short: "Контакти: address, tel, mailto, зовнішнє посилання", text: "У розділі «Контакти» елемент <code>address</code> із посиланнями <code>tel:</code> і <code>mailto:</code>; зовнішнє посилання відкривається в новій вкладці з <code>rel=\"noopener\"</code>.",
        hint: "Телефон: <code>href=\"tel:+380561234567\"</code>. Для <code>target=\"_blank\"</code> додавайте <code>rel=\"noopener noreferrer\"</code>.",
        checks: [
          { selector: "#contacts address" },
          { selector: "#contacts address a", attr: { name: "href", matches: "^tel:\\+?\\d+$" } },
          { selector: "#contacts address a", attr: { name: "href", matches: "^mailto:.+@.+" } },
          { selector: "#contacts a[target=\"_blank\"]", attr: { name: "rel", has: "noopener" } },
        ] },
      { id: "R8", short: "Чистий і доступний код без застарілого", text: "Усі зображення мають <code>alt</code>, усі посилання <code>href</code>; немає застарілих <code>font</code>, <code>center</code>, <code>marquee</code>; на сторінці один <code>h1</code> і один <code>main</code>.",
        hint: "Шукайте зображення без <code>alt</code> і теги <code>&lt;font&gt;</code>/<code>&lt;center&gt;</code>: їх замінили стилі.",
        checks: [
          { selector: "img:not([alt])", not: true },
          { selector: "a:not([href])", not: true },
          { selector: "font, center, marquee", not: true },
          { selector: "h1", count: 1 },
          { selector: "main", count: 1 },
        ] },
      { id: "R9", short: "Підвал з копірайтом і назвою кафе", text: "У <code>footer</code> є знак © і назва кафе.",
        hint: "Знак © можна написати як <code>&amp;copy;</code> або самим символом.",
        checks: [
          { selector: "body > footer", text: "©" },
          { selector: "body > footer", text: "Лаванда" },
        ] },
    ],
  },
  {
    id: "html-article-page", course: "html", runtime: "page", xp: 60,
    after: "html/10", needs: ["семантичні теги", "доступність (landmarks, skip-link, alt)", "мета-теги", "Open Graph", "структуровані дані JSON-LD", "time, address, figure, aside"],
    title: "Проєкт: сторінка статті з SEO та доступністю",
    context: "Сторінка статті мусить подобатись трьом «читачам» одразу: людині, пошуковій системі й програмі для незрячих. Правильна семантика, мета-теги та структуровані дані дають видимість у пошуку, красиві прев'ю в месенджерах і зручність без миші.",
    brief: [
      "Зверстайте сторінку статті «Як вивчити HTML за місяць» за вимогами нижче: семантична структура, доступність, мета-теги для пошуку та соцмереж, структуровані дані.",
      "Дані (тексти) вигадайте самі, але зберігайте реалістичні довжини: заголовок вкладки до 60 символів, опис 70–160.",
    ],
    contract: [
      "посилання «Перейти до змісту» — перший елемент <code>body</code>, веде на <code>#content</code>",
      "орієнтири: <code>header</code> із <code>nav</code>, <code>main id=\"content\"</code>, <code>aside</code>, <code>footer</code>",
      "стаття: <code>article</code> із <code>h1</code>, <code>time</code>, автором, трьома і більше <code>h2</code>",
      "<code>&lt;script type=\"application/ld+json\"&gt;</code> із типом <code>Article</code>",
    ],
    mockup: [
      "[Перейти до змісту]",
      "Сайт «Вебстарт»     [Головна] [Статті] [Про нас]",
      "──────────────────────────────────────────",
      "Як вивчити HTML за місяць",
      "Автор: Олена Коваль · 12 листопада 2026",
      "[ ілюстрація + підпис ]",
      "  ## Тиждень 1  ## Тиждень 2  ## Тиждень 3 (тексти)",
      "Читайте також",
      "  • стаття 1  • стаття 2  • стаття 3",
      "──────────────────────────────────────────",
      "© 2026 Вебстарт · Політика · Контакти",
    ].join("\n"),
    starter: raw`<!DOCTYPE html>
<html>
<head>
  <title>Стаття</title>
</head>
<body>
  <div class="header">Сайт «Вебстарт»</div>
  <div class="content">
    <div class="title">Як вивчити HTML за місяць</div>
    <div>Автор: Олена Коваль</div>
    <p>Текст статті...</p>
  </div>
</body>
</html>
`,
    requirements: [
      { id: "R1", short: "Title до 60 символів, description 70–160, canonical, lang", text: "Заголовок вкладки <code>title</code> має 15–60 символів; є <code>meta name=\"description\"</code> довжиною 70–160 символів, <code>link rel=\"canonical\"</code> з адресою <code>https://…</code>, <code>meta viewport</code> і <code>lang=\"uk\"</code>.",
        hint: "Пошукові системи обрізають надто довгі заголовки й описи. Рахуйте символи.",
        checks: [
          { source: { matches: "<title>[^<]{15,60}</title>" } },
          { selector: "head > meta[name=\"description\"]", attr: { name: "content", matches: "^.{70,160}$" } },
          { selector: "head > link[rel=\"canonical\"]", attr: { name: "href", matches: "^https://" } },
          { selector: "head > meta[name=\"viewport\"]" },
          { selector: "html", attr: { name: "lang", equals: "uk" } },
        ] },
      { id: "R2", short: "Open Graph і Twitter Card для прев'ю", text: "Є <code>og:title</code>, <code>og:description</code>, <code>og:image</code> (з адресою <code>https://…</code>), <code>og:type</code> зі значенням <code>article</code> і <code>twitter:card</code>.",
        hint: "Теги Open Graph: <code>&lt;meta property=\"og:title\" content=\"…\"&gt;</code>. Для Twitter ім'я пишуть через <code>name</code>.",
        checks: [
          { selector: "meta[property=\"og:title\"]", attr: { name: "content", matches: "^.{5,}$" } },
          { selector: "meta[property=\"og:description\"]", attr: { name: "content", matches: "^.{20,}$" } },
          { selector: "meta[property=\"og:image\"]", attr: { name: "content", matches: "^https://" } },
          { selector: "meta[property=\"og:type\"]", attr: { name: "content", equals: "article" } },
          { selector: "meta[name=\"twitter:card\"]" },
        ] },
      { id: "R3", short: "Орієнтири: header+nav, main#content, aside, footer", text: "Сторінка має <code>header</code> з навігацією <code>nav</code> (з <code>aria-label</code>), один <code>main id=\"content\"</code>, <code>aside</code> і <code>footer</code>.",
        hint: "Орієнтири допомагають користувачам скрінрідерів перестрибувати між частинами сторінки.",
        checks: [
          { selector: "body > header nav[aria-label]" },
          { selector: "main#content", count: 1 },
          { selector: "aside" },
          { selector: "body > footer" },
        ] },
      { id: "R4", short: "Skip-link «Перейти до змісту» першим у body", text: "Першим елементом <code>body</code> є посилання «Перейти до змісту», що веде на <code>#content</code>.",
        hint: "Таке посилання дозволяє людині з клавіатурою одразу пропустити навігацію.",
        checks: [{ selector: "body > a:first-child", attr: { name: "href", equals: "#content" }, text: "Перейти до змісту" }] },
      { id: "R5", short: "Стаття: h1, time, автор, щонайменше три h2", text: "<code>article</code> містить <code>header</code> з єдиним <code>h1</code>, <code>time</code> з атрибутом <code>datetime</code> у форматі <code>РРРР-ММ-ДД</code>, автора (<code>a rel=\"author\"</code>) і щонайменше три підрозділи <code>h2</code>.",
        hint: "Дата для машин: <code>&lt;time datetime=\"2026-11-12\"&gt;12 листопада 2026&lt;/time&gt;</code>.",
        checks: [
          { selector: "main article > header > h1", count: 1 },
          { selector: "article time", attr: { name: "datetime", matches: "^\\d{4}-\\d{2}-\\d{2}" } },
          { selector: "article a[rel=\"author\"]" },
          { selector: "article h2", count: { min: 3 } },
          { selector: "h1", count: 1 },
        ] },
      { id: "R6", short: "Ілюстрація: figure, alt, розміри, lazy, figcaption", text: "У статті є <code>figure</code> із зображенням: змістовний <code>alt</code> (від 10 символів), <code>width</code>, <code>height</code>, <code>loading=\"lazy\"</code> і підпис <code>figcaption</code>.",
        hint: "<code>loading=\"lazy\"</code> відкладає завантаження картинки, поки вона не наблизиться до екрана.",
        checks: [
          { selector: "article figure > img", attr: { name: "alt", matches: "^.{10,}$" } },
          { selector: "article figure > img", attr: { name: "width", matches: "^\\d+$" } },
          { selector: "article figure > img", attr: { name: "height", matches: "^\\d+$" } },
          { selector: "article figure > img", attr: { name: "loading", equals: "lazy" } },
          { selector: "article figure > figcaption" },
        ] },
      { id: "R7", short: "Блок «Читайте також»: aside з трьома посиланнями", text: "У <code>aside</code> заголовок <code>h2</code> «Читайте також» і список щонайменше з трьох посилань на інші матеріали.",
        hint: "Посилання краще робити списком: <code>ul &gt; li &gt; a</code>.",
        checks: [
          { selector: "aside > h2", text: "Читайте також" },
          { selector: "aside ul > li > a", count: { min: 3 } },
        ] },
      { id: "R8", short: "Структуровані дані JSON-LD типу Article", text: "У <code>head</code> є <code>script type=\"application/ld+json\"</code> із типом <code>Article</code>, полями <code>headline</code> і <code>datePublished</code>.",
        hint: "Це допомагає пошуковикам розуміти сторінку. Не забувайте лапки: це JSON, а не HTML.",
        checks: [
          { selector: "head > script[type=\"application/ld+json\"]" },
          { source: { matches: "\"@type\"\\s*:\\s*\"Article\"" } },
          { source: { matches: "\"headline\"\\s*:" } },
          { source: { matches: "\"datePublished\"\\s*:" } },
        ] },
      { id: "R9", short: "Доступність: alt, href, без позитивного tabindex", text: "Усі зображення мають <code>alt</code>, усі посилання <code>href</code> (не порожній <code>#</code>), жоден елемент не має позитивного <code>tabindex</code>.",
        hint: "Позитивний <code>tabindex</code> ламає природний порядок переходу клавішею Tab.",
        checks: [
          { selector: "img:not([alt])", not: true },
          { selector: "a:not([href])", not: true },
          { selector: "a[href=\"#\"]", not: true },
          { selector: "[tabindex]:not([tabindex=\"0\"]):not([tabindex=\"-1\"])", not: true },
        ] },
      { id: "R10", short: "Підвал з © і щонайменше двома посиланнями", text: "У <code>footer</code> знак © і щонайменше два посилання (наприклад, «Політика» та «Контакти»).",
        hint: "Підвал на кожній сторінці зазвичай веде на службові розділи сайту.",
        checks: [
          { selector: "body > footer", text: "©" },
          { selector: "body > footer a", count: { min: 2 } },
        ] },
    ],
  },
];
