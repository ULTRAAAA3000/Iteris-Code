// Практичні завдання глави «Основи мови» (уроки 5–19). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_02: readonly RemoteTask[] = [
  {
    ...base, id: "c-variables-types", lesson: "c/5", xp: 20,
    title: "Клас у цифрах: int, double і char разом",
    context: "Майже кожна програма тримає в змінних ціле, дробове й символ одночасно. Правильний тип для кожного значення це перша перевірка, що ви розумієте, що саме зберігаєте.",
    brief: [
      "Оголосіть змінні: <code>int boys = 12</code>, <code>int girls = 16</code>, <code>int total</code> як їхню суму, <code>double average = 4.25</code> і <code>char group = 'B'</code>.",
      "Виведіть один рядок <code>Група B: 28 учнів, середній бал 4.25</code>, підставивши значення змінних через <code>%c</code>, <code>%d</code> і <code>%.2f</code>.",
    ],
    starter: raw`#include <stdio.h>

int main(void) {
    printf("Група ?\n");
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Літера групи виведена через char", has: "Група B:", hint: "Оголосіть char group = 'B'; і підставте її в printf через %c." },
      { on: "stdout", name: "Кількість учнів дорівнює 28", has: "28 учнів", hint: "total має бути сумою boys + girls, а не числом, вписаним руками." },
      { on: "stdout", name: "Повний рядок збігається", equals: "Група B: 28 учнів, середній бал 4.25", hint: "Формат: Група %c: %d учнів, середній бал %.2f і перенос рядка наприкінці." },
      { on: "source", name: "Сума обчислюється виразом", matches: "boys\\s*\\+\\s*girls", hint: "int total = boys + girls;" },
      { on: "source", name: "Оголошено змінну типу double", matches: "double\\s+average", hint: "Середній бал це дробове число: double average = 4.25;" },
    ],
  },
  {
    ...base, id: "c-const-init", lesson: "c/6", xp: 20,
    title: "Замовлення зі знижкою: const й ініціалізація",
    context: "Ціни, ставки й ліміти в програмі не повинні змінюватися випадково. Позначка const разом із початковим значенням робить такі змінні надійними, а помилку зміни ловить компілятор.",
    brief: [
      "Оголосіть <code>const int unit_price = 15</code>, <code>int quantity = 4</code> і <code>int total = unit_price * quantity</code>. Виведіть <code>Разом: 60</code>.",
      "Додайте <code>const double discount = 0.1</code> і обчисліть <code>double final_price = total * (1 - discount)</code>. Виведіть <code>Зі знижкою: 54.00</code>. Усі змінні ініціалізуйте в місці оголошення.",
    ],
    starter: raw`#include <stdio.h>

int main(void) {
    printf("Разом: %d\n", 0);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Сума замовлення дорівнює 60", has: "Разом: 60", hint: "total = unit_price * quantity, тобто 15 * 4." },
      { on: "stdout", name: "Ціна зі знижкою дорівнює 54.00", has: "Зі знижкою: 54.00", hint: "Помножте total на (1 - discount) і виведіть через %.2f." },
      { on: "stdout", name: "Обидва рядки без зайвого", equals: "Разом: 60\nЗі знижкою: 54.00", hint: "Спершу рядок «Разом», потім «Зі знижкою»." },
      { on: "source", name: "Ціна за одиницю оголошена як const int", matches: "const\\s+int\\s+unit_price\\s*=", hint: "const int unit_price = 15; зі значенням одразу." },
      { on: "source", name: "Знижка оголошена як const double", matches: "const\\s+double\\s+discount\\s*=", hint: "const double discount = 0.1;" },
    ],
  },
  {
    ...base, id: "c-int-ranges", lesson: "c/7", xp: 25,
    title: "Межі цілих: обертання й широкий тип",
    context: "Лічильники, хеші й мережеві поля мають фіксований розмір, тому вихід за межі типу це справжня причина багів. Обертання беззнакових і розширення типу перед додаванням потрібні в будь-якому системному коді.",
    brief: [
      "У заготовці є <code>uint8_t level = 250</code>. Додайте до неї 10 і виведіть <code>uint8: 4</code>, бо беззнаковий тип обертається. Потім візьміть <code>uint32_t zero = 0</code>, відніміть 1 і виведіть <code>uint32: 4294967295</code>.",
      "Нарешті покладіть <code>INT32_MAX</code> у <code>int64_t wide</code>, додайте 1 і виведіть <code>int64: 2147483648</code>. Для друку <code>int64_t</code> використайте <code>%lld</code> і приведення <code>(long long)</code>.",
    ],
    starter: raw`#include <stdint.h>
#include <stdio.h>

int main(void) {
    uint8_t level = 250;
    printf("uint8: %d\n", level);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "uint8_t обертається: 250 + 10 дає 4", has: "uint8: 4", hint: "Присвойте level = level + 10; значення 260 за модулем 256 дає 4." },
      { on: "stdout", name: "0 мінус 1 у uint32_t дає максимум", has: "uint32: 4294967295", hint: "Оголосіть uint32_t zero = 0; і відніміть 1. Для друку підійде %u." },
      { on: "stdout", name: "Додавання в int64_t не переповнюється", has: "int64: 2147483648", hint: "int64_t wide = INT32_MAX; wide = wide + 1; друкуйте через %lld і (long long)." },
      { on: "stdout", name: "Усі три рядки в потрібному порядку", equals: "uint8: 4\nuint32: 4294967295\nint64: 2147483648", hint: "Порядок: uint8, uint32, int64, кожен рядок завершується \\n." },
      { on: "source", name: "Використано int64_t", matches: "int64_t\\s+\\w+", hint: "Оголосіть широку змінну типу int64_t з stdint.h." },
    ],
  },
  {
    ...base, id: "c-float-compare", lesson: "c/8", xp: 25,
    title: "Порівняння дробових чисел із допуском",
    context: "Дробові результати майже ніколи не збігаються точно, тому порівняння через == дає хибні відмови в обчисленнях і тестах. Порівняння з допуском це звичайна практика в розрахунках.",
    brief: [
      "У заготовці виводиться, що <code>0.1 + 0.2 == 0.3</code> хибне. Додайте перед цим рядок <code>sum: 0.30000000000000004</code> (виведіть <code>sum</code> через <code>%.17f</code>) і після нього рядок <code>close: 1</code>.",
      "Рядок <code>close</code> має обчислювати вираз <code>fabs(sum - 0.3) &lt; eps</code> із <code>double eps = 1e-9</code>. Останнім виведіть <code>digits: 15</code>, значення візьміть із <code>DBL_DIG</code> із <code>float.h</code>.",
    ],
    starter: raw`#include <math.h>
#include <stdio.h>

int main(void) {
    double sum = 0.1 + 0.2;
    printf("exact: %d\n", sum == 0.3);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Виведено сумою з 17 знаками", has: "sum: 0.30000000000000004", hint: "printf(\"sum: %.17f\\n\", sum);" },
      { on: "stdout", name: "Порівняння з допуском дає 1", has: "close: 1", hint: "fabs(sum - 0.3) < eps дає 1, якщо eps = 1e-9." },
      { on: "stdout", name: "Виведено DBL_DIG", has: "digits: 15", hint: "Підключіть float.h і підставте DBL_DIG через %d." },
      { on: "stdout", name: "Усі чотири рядки в потрібному порядку", equals: "sum: 0.30000000000000004\nexact: 0\nclose: 1\ndigits: 15", hint: "Порядок: sum, exact, close, digits." },
      { on: "source", name: "Використано fabs", matches: "fabs\\s*\\(", hint: "Модуль різниці дає fabs з math.h." },
    ],
  },
  {
    ...base, id: "c-casts", lesson: "c/9", xp: 25,
    title: "Середнє без втрати дробу й розширення типів",
    context: "Ціле ділення тихо відкидає дробову частину, і середні значення виходять хибними. Явне приведення й розуміння розширення типів знімають цей клас помилок.",
    brief: [
      "У заготовці середнє <code>total / count</code> для 17 і 4 виходить <code>4.00</code>. Виправте обчислення так, щоб воно друкувало <code>avg: 4.25</code>, використавши приведення <code>(double)</code>.",
      "Потім виведіть <code>cut: -3</code> (приведення <code>-3.99</code> до <code>int</code>) і <code>promoted: 300</code> для суми двох <code>unsigned char</code> зі значеннями 200 і 100.",
    ],
    starter: raw`#include <stdio.h>

int main(void) {
    int total = 17;
    int count = 4;
    double avg = total / count;
    printf("avg: %.2f\n", avg);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Середнє дорівнює 4.25", has: "avg: 4.25", hint: "Зробіть один операнд дробовим до ділення: (double)total / count." },
      { on: "stdout", name: "Приведення -3.99 до int дає -3", has: "cut: -3", hint: "Приведення (int) відсікає дріб у бік нуля." },
      { on: "stdout", name: "Сума unsigned char рахується в int", has: "promoted: 300", hint: "x + y у виразі має тип int, тому вийде 300, а не 44." },
      { on: "stdout", name: "Три рядки в потрібному порядку", equals: "avg: 4.25\ncut: -3\npromoted: 300", hint: "Порядок: avg, cut, promoted." },
      { on: "source", name: "Є явне приведення до double", matches: "\\(double\\)", hint: "Запишіть (double) перед одним з операндів ділення." },
    ],
  },
  {
    ...base, id: "c-char-arith", lesson: "c/10", xp: 25,
    title: "Символи як числа: цифра, регістр і шифр Цезаря",
    context: "Розбір тексту, паролі й найпростіші шифри працюють із символами як із числами. Арифметика над кодами й ctype.h це базовий набір для будь-якого парсера.",
    brief: [
      "Виведіть чотири рядки. <code>digit: 7</code>: символ <code>'7'</code> перетворіть на число відніманням <code>'0'</code>. <code>upper: H</code>: результат <code>toupper('h')</code> через <code>%c</code>.",
      "<code>caesar: a</code>: зсунути <code>ch = 'x'</code> на три позиції по колу алфавіту формулою <code>'a' + (ch - 'a' + 3) % 26</code>, і <code>code: 97</code>: код цієї літери через <code>%d</code>.",
    ],
    starter: raw`#include <ctype.h>
#include <stdio.h>

int main(void) {
    char ch = 'x';
    printf("caesar: %c\n", ch);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Цифра символу '7' стала числом 7", has: "digit: 7", hint: "Віднімання '0' від символу цифри дає її значення." },
      { on: "stdout", name: "toupper перетворює h на H", has: "upper: H", hint: "printf(\"upper: %c\\n\", toupper('h'));" },
      { on: "stdout", name: "Шифр Цезаря перевів x в a", has: "caesar: a", hint: "'a' + (ch - 'a' + 3) % 26; остача повертає зсув на початок алфавіту." },
      { on: "stdout", name: "Усі чотири рядки в потрібному порядку", equals: "digit: 7\nupper: H\ncaesar: a\ncode: 97", hint: "Порядок: digit, upper, caesar, code. Код виводьте через %d." },
      { on: "source", name: "Використано віднімання '0'", matches: "-\\s*'0'", hint: "Перетворення цифри в число: digit_char - '0'." },
    ],
  },
  {
    ...base, id: "c-printf-table", lesson: "c/11", xp: 30,
    title: "Таблиця товарів: ширина, точність і повернене значення",
    context: "Звіти й логи читають очима, тому колонки мають бути вирівняні. Ширина полів і точність у printf дають акуратну таблицю без жодної допоміжної бібліотеки.",
    brief: [
      "Виведіть таблицю з заголовком і двома рядками. Формат заголовка <code>|%-10s|%6s|%9s|</code>, формат рядків <code>|%-10s|%6d|%9.2f|</code>. Дані: <code>Bread</code>, 3, 25.5 і <code>Milk</code>, 12, 9.99.",
      "Результат першого рядка даних (<code>Bread</code>) збережіть у змінну: <code>printf</code> повертає кількість надрукованих байтів. Виведіть її окремим рядком <code>row length: 30</code>.",
    ],
    starter: raw`#include <stdio.h>

int main(void) {
    printf("%s %s %s\n", "Item", "Qty", "Price");
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Рядок Bread вирівняно по ширині колонок", has: "|Bread     |     3|    25.50|", hint: "Формат |%-10s|%6d|%9.2f|: назва ліворуч, числа праворуч." },
      { on: "stdout", name: "Рядок Milk вирівняно по ширині колонок", has: "|Milk      |    12|     9.99|", hint: "Той самий формат, значення: \"Milk\", 12, 9.99." },
      { on: "stdout", name: "Довжина рядка взята з printf", has: "row length: 30", hint: "int n = printf(...); потім виведіть n. Рядок має 29 символів і \\n." },
      { on: "stdout", name: "Уся таблиця збігається", equals: "|Item      |   Qty|    Price|\n|Bread     |     3|    25.50|\n|Milk      |    12|     9.99|\nrow length: 30", hint: "Заголовок: |%-10s|%6s|%9s|. Далі Bread, Milk і рядок з довжиною." },
      { on: "source", name: "Використано ліве вирівнювання й точність", matches: "%-10s[\\s\\S]*%9\\.2f", hint: "У форматі потрібні %-10s і %9.2f." },
    ],
  },
];
