import type { RefSection } from "./types.ts";

const raw = String.raw;

export const css: RefSection[] = [
  { t: "Основи", items: [
    { t: "Правило", code: raw`h1 {
  color: #2F5BEA;
  font-size: 2rem;
}`, note: "Правило складається з селектора та блоку властивостей у `{}`. Кожна властивість закінчується крапкою з комою." },
    { t: "Підключення", code: raw`<link rel="stylesheet" href="style.css">

<style>
  p { margin: 0 0 1rem; }
</style>

<p style="color: red">Рядковий стиль</p>`, note: "Найкращий спосіб це окремий файл стилів." },
    { t: "Коментарі", code: raw`/* коментар у CSS */`, note: "Односторонніх коментарів `//` у CSS немає." },
  ] },
  { t: "Селектори", items: [
    { t: "Базові", code: raw`p { }              /* за тегом */
.card { }          /* за класом */
#header { }        /* за id (унікальний) */
* { }              /* усі елементи */
a, button { }      /* кілька селекторів */`, note: "Класи використовують частіше, ніж `id`: їх можна повторювати." },
    { t: "Комбінатори", code: raw`.menu a { }        /* усі a всередині .menu */
.menu > li { }      /* лише прямі діти */
h2 + p { }          /* p одразу після h2 */`, note: "Пробіл означає «будь-який вкладений елемент»." },
    { t: "Псевдокласи", code: raw`a:hover { color: tomato; }
input:focus { outline: 2px solid #2F5BEA; }
li:first-child { font-weight: 700; }
li:nth-child(2n) { background: #eee; }`, note: "Псевдоклас описує стан або позицію елемента." },
  ] },
  { t: "Кольори й одиниці", items: [
    { t: "Запис кольору", code: raw`color: red;
color: #2F5BEA;
color: rgb(47, 91, 234);
color: rgba(0, 0, 0, 0.5);
color: hsl(220, 80%, 55%);`, note: "`rgba` і `hsl` дозволяють задати прозорість та відтінок." },
    { t: "Одиниці виміру", code: raw`width: 300px;      /* пікселі */
font-size: 1.2rem; /* відносно розміру шрифту сторінки */
padding: 2em;      /* відносно шрифту елемента */
width: 50%;        /* відсоток від батька */
height: 100vh;     /* висота вікна */`, note: "Для шрифтів і відступів зручні `rem` та `em`." },
  ] },
  { t: "Текст", items: [
    { t: "Шрифт і вирівнювання", code: raw`body {
  font-family: "Inter", Arial, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  text-align: left;
  text-decoration: none;
  text-transform: uppercase;
}`, note: "Перелік шрифтів у `font-family` це запасні варіанти по порядку." },
  ] },
  { t: "Блочна модель", items: [
    { t: "Відступи, рамка, розмір", code: raw`.box {
  width: 300px;
  padding: 16px;              /* всередині */
  border: 2px solid #333;
  margin: 20px auto;          /* зовні; auto центрує */
  box-sizing: border-box;     /* ширина включає padding і border */
}`, note: "Порядок зсередини назовні: зміст, `padding`, `border`, `margin`." },
    { t: "Скорочений запис", code: raw`margin: 10px;                /* усі боки */
margin: 10px 20px;           /* верх-низ, ліво-право */
margin: 10px 20px 30px 40px; /* верх, право, низ, ліво */
border-radius: 8px;`, note: "Чотири значення йдуть за годинниковою стрілкою від верху." },
  ] },
  { t: "Flexbox", items: [
    { t: "Ряд із вирівнюванням", code: raw`.row {
  display: flex;
  gap: 16px;
  justify-content: space-between;  /* по головній осі */
  align-items: center;             /* по поперечній осі */
  flex-wrap: wrap;
}
.row .item { flex: 1; }`, note: "Flexbox розкладає елементи в ряд або стовпчик. Напрямок змінює `flex-direction: column`." },
  ] },
  { t: "Grid", items: [
    { t: "Сітка", code: raw`.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.wide { grid-column: span 2; }`, note: "`1fr` це частка вільного місця. Grid зручний для двовимірних макетів." },
  ] },
  { t: "Позиціювання", items: [
    { t: "position", code: raw`.parent { position: relative; }
.badge {
  position: absolute;
  top: 8px;
  right: 8px;
}
.header { position: sticky; top: 0; z-index: 10; }`, note: "`absolute` позиціюється відносно найближчого предка з `position`, відмінним від `static`." },
  ] },
  { t: "Адаптивність і анімації", items: [
    { t: "Медіазапит", code: raw`.card { width: 33%; }

@media (max-width: 600px) {
  .card { width: 100%; }
}`, note: "Блок усередині `@media` працює лише на екранах, що підходять під умову." },
    { t: "Змінні й transition", code: raw`:root { --accent: #2F5BEA; }
.btn {
  background: var(--accent);
  transition: transform 0.2s ease;
}
.btn:hover { transform: translateY(-2px); }`, note: "Змінні `--name` задаються один раз і підставляються через `var()`." },
  ] },
];
