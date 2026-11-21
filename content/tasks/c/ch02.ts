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
  {
    ...base, id: "c-conditions", lesson: "c/12", xp: 20,
    title: "Оцінка, максимум і безпечне ділення",
    context: "Розгалуження, тернарний вибір і захист від ділення на нуль зустрічаються в кожній програмі. Порядок гілок і скорочене обчислення це те, на чому найчастіше помиляються.",
    brief: [
      "Для <code>score = 82</code> оберіть літеру ланцюжком <code>if / else if / else</code> (від 90 це A, від 75 це B, інакше C) у змінну <code>char grade</code> і виведіть <code>grade: B</code>. Максимум <code>a = 7</code> і <code>b = 12</code> знайдіть тернарним оператором: <code>max: 12</code>.",
      "Для <code>d = 0</code> перевірте умову <code>d != 0 &amp;&amp; 100 / d &gt; 5</code>. Коли вона хибна, виведіть <code>safe: yes</code>, інакше <code>safe: no</code>. Ділення на нуль не повинно виконатися.",
    ],
    starter: raw`#include <stdio.h>

int main(void) {
    int score = 82;
    int a = 7;
    int b = 12;
    int d = 0;
    printf("grade: ?\n");
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Оцінка для 82 це B", has: "grade: B", hint: "Перевіряйте від найвищої межі: score >= 90, потім score >= 75, потім else." },
      { on: "stdout", name: "Максимум дорівнює 12", has: "max: 12", hint: "int max = a > b ? a : b;" },
      { on: "stdout", name: "Ділення на нуль захищено", has: "safe: yes", hint: "Умова d != 0 && 100 / d > 5 хибна вже на лівій частині." },
      { on: "stdout", name: "Три рядки в потрібному порядку", equals: "grade: B\nmax: 12\nsafe: yes", hint: "Порядок: grade, max, safe." },
      { on: "source", name: "Використано тернарний оператор", matches: "\\?[^;]*:", hint: "Тернарний вираз має вигляд умова ? якщо_так : якщо_ні." },
      { on: "source", name: "Використано &&", has: "&&", hint: "Захист: d != 0 && 100 / d > 5." },
    ],
  },
  {
    ...base, id: "c-switch-days", lesson: "c/13", xp: 20,
    title: "Дні в місяці й калькулятор через switch",
    context: "Вибір за кодом команди чи номером місяця природно лягає на switch. Групування міток і default це те, що відрізняє акуратний switch від довгого ланцюжка else if.",
    brief: [
      "Для <code>month = 6</code> порахуйте кількість днів у змінній <code>days</code> оператором <code>switch</code>: місяці 4, 6, 9 і 11 мають 30 днів (згрупуйте мітки), 2 це 28, інші 31. Виведіть <code>days: 30</code>.",
      "Потім для <code>a = 6</code>, <code>b = 7</code>, <code>op = '*'</code> оберіть дію в другому <code>switch</code> (<code>+</code>, <code>-</code>, <code>*</code>) і виведіть <code>result: 42</code>. Для невідомої дії додайте <code>default</code>.",
    ],
    starter: raw`#include <stdio.h>

int main(void) {
    int month = 6;
    int a = 6;
    int b = 7;
    char op = '*';
    printf("days: 0\n");
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "У червні 30 днів", has: "days: 30", hint: "Згрупуйте case 4: case 6: case 9: case 11: з одним break." },
      { on: "stdout", name: "Результат множення дорівнює 42", has: "result: 42", hint: "Для case '*' присвойте result = a * b; і поставте break." },
      { on: "stdout", name: "Два рядки в потрібному порядку", equals: "days: 30\nresult: 42", hint: "Спершу days, потім result." },
      { on: "source", name: "Використано два switch", matches: "switch\\s*\\([\\s\\S]*switch\\s*\\(", hint: "Один switch для місяця, другий для дії." },
      { on: "source", name: "Є default", has: "default:", hint: "Додайте default: для несподіваного значення." },
    ],
  },
  {
    ...base, id: "c-while-digits", lesson: "c/14", xp: 25,
    title: "Цифри числа: кількість, сума й розворот",
    context: "Розбір числа по цифрах через % 10 і / 10 є основою багатьох задач: контрольних сум, перевірки номерів, перетворення систем числення. Цикл з умовою підходить, коли кількість кроків наперед невідома.",
    brief: [
      "Для числа <code>12345</code> обчисліть циклом <code>while</code> три значення: кількість цифр, суму цифр і число з цифрами в зворотному порядку. Перші дві відповіді <code>5</code> і <code>15</code>.",
      "Виведіть три рядки: <code>digits: 5</code>, <code>sum: 15</code> і <code>reversed: 54321</code>. Копію числа змінюйте в циклі, оригінал лишіть незайманим.",
    ],
    starter: raw`#include <stdio.h>

int main(void) {
    int number = 12345;
    int n = number;
    int digits = 0;
    printf("digits: %d\n", digits);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Кількість цифр дорівнює 5", has: "digits: 5", hint: "У кожній ітерації збільшуйте digits і ділите n на 10." },
      { on: "stdout", name: "Сума цифр дорівнює 15", has: "sum: 15", hint: "Додавайте n % 10 до суми, поки n більше нуля." },
      { on: "stdout", name: "Розворот числа дорівнює 54321", has: "reversed: 54321", hint: "reversed = reversed * 10 + n % 10;" },
      { on: "stdout", name: "Три рядки в потрібному порядку", equals: "digits: 5\nsum: 15\nreversed: 54321", hint: "Порядок: digits, sum, reversed." },
      { on: "source", name: "Використано цикл while", matches: "while\\s*\\(", hint: "Цикл while (n > 0) { ... } обробляє по одній цифрі." },
    ],
  },
  {
    ...base, id: "c-for-squares", lesson: "c/15", xp: 25,
    title: "Квадрати, сума й відлік назад циклами for",
    context: "Цикл for із відомою кількістю кроків це основа обробки даних. Правильні межі й крок захищають від помилки на одиницю, яка відповідає за значну частку багів у реальному коді.",
    brief: [
      "Циклом <code>for</code> від 1 до 5 виведіть у першому рядку квадрати <code>1 4 9 16 25</code> через пропуск і накопичте їхню суму. Другим рядком виведіть <code>sum: 55</code>.",
      "Третім рядком виведіть відлік назад із кроком 3: <code>down: 10 7 4 1</code>, теж циклом <code>for</code>. Змінні циклів оголосіть у заголовку.",
    ],
    starter: raw`#include <stdio.h>

int main(void) {
    int sum = 0;
    printf("sum: %d\n", sum);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Квадрати від 1 до 5", has: "1 4 9 16 25", hint: "for (int i = 1; i <= 5; i++) і друк i * i через пропуск." },
      { on: "stdout", name: "Сума квадратів дорівнює 55", has: "sum: 55", hint: "У тому ж циклі додавайте i * i до sum." },
      { on: "stdout", name: "Відлік назад із кроком 3", has: "down: 10 7 4 1", hint: "for (int i = 10; i > 0; i -= 3)." },
      { on: "stdout", name: "Усі три рядки в потрібному порядку", equals: "1 4 9 16 25\nsum: 55\ndown: 10 7 4 1", hint: "Після рядка квадратів виведіть \\n, потім sum, потім down." },
      { on: "source", name: "Змінна оголошена в заголовку for", matches: "for\\s*\\(\\s*int\\s+\\w+\\s*=", hint: "for (int i = 1; ...; ...)." },
    ],
  },
  {
    ...base, id: "c-break-continue", lesson: "c/16", xp: 25,
    title: "Пропустити парні, зупинитися на великому",
    context: "Відсіювання непотрібних ітерацій через continue й дострокове завершення через break скорочують вкладеність і зайву роботу в обробці даних. Також важливо знати, чому лічильник після break зберігає значення.",
    brief: [
      "Пройдіть циклом <code>for</code> числа від 1 до 20. Парні пропускайте через <code>continue</code>. Коли число стане більшим за 9, вийдіть із циклу через <code>break</code>. Інші додавайте до <code>sum</code>.",
      "Лічильник <code>i</code> оголосіть до циклу, щоб бачити його після виходу. Виведіть <code>sum: 25</code> (1+3+5+7+9) і <code>stopped: 11</code>.",
    ],
    starter: raw`#include <stdio.h>

int main(void) {
    int sum = 0;
    int i;
    for (i = 1; i <= 20; i++) {
        sum += i;
    }
    printf("sum: %d\nstopped: %d\n", sum, i);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Сума непарних до 9 дорівнює 25", has: "sum: 25", hint: "Парні пропустіть: if (i % 2 == 0) { continue; }." },
      { on: "stdout", name: "Цикл зупинився на 11", has: "stopped: 11", hint: "Парне 10 пропускається, непарне 11 більше за 9, тоді break. Лічильник оголошено до циклу." },
      { on: "stdout", name: "Обидва рядки без зайвого", equals: "sum: 25\nstopped: 11", hint: "Спершу sum, потім stopped." },
      { on: "source", name: "Використано continue", has: "continue", hint: "Пропуск парних через continue." },
      { on: "source", name: "Використано break", has: "break", hint: "Вихід, коли i більше за 9, через break." },
    ],
  },
  {
    ...base, id: "c-functions-max", lesson: "c/17", xp: 25,
    title: "Дві функції з прототипами: max3 і sum_to",
    context: "Виокремлення дії у функцію дає їй ім'я й повторне використання, а прототип дозволяє тримати main нагорі файлу. Так будують програми будь-якого розміру.",
    brief: [
      "У заготовці функції <code>max3</code> і <code>sum_to</code> повертають 0. Реалізуйте <code>int max3(int a, int b, int c)</code>, яка повертає найбільше з трьох, і <code>int sum_to(int n)</code>, яка повертає суму чисел від 1 до n.",
      "Прототипи й <code>main</code> залиште як є. Програма має вивести <code>max3: 9</code> і <code>sum_to: 55</code>.",
    ],
    starter: raw`#include <stdio.h>

int max3(int a, int b, int c);
int sum_to(int n);

int main(void) {
    printf("max3: %d\n", max3(4, 9, 7));
    printf("sum_to: %d\n", sum_to(10));
    return 0;
}

int max3(int a, int b, int c) {
    return 0;
}

int sum_to(int n) {
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "max3 повертає найбільше з трьох", has: "max3: 9", hint: "Порівняйте a, b і c, наприклад, зберігайте найбільше у змінну best." },
      { on: "stdout", name: "sum_to(10) дорівнює 55", has: "sum_to: 55", hint: "Накопичуйте суму циклом for від 1 до n й поверніть її через return." },
      { on: "stdout", name: "Обидва рядки без зайвого", equals: "max3: 9\nsum_to: 55", hint: "main змінювати не потрібно: виводьте лише через виклики функцій." },
      { on: "source", name: "Прототип max3 лишився", has: "int max3(int a, int b, int c);", hint: "Не видаляйте прототипи вгорі файлу." },
      { on: "source", name: "sum_to використовує цикл", matches: "sum_to\\s*\\(int n\\)\\s*\\{[\\s\\S]*(for|while)\\s*\\(", hint: "У тілі sum_to використайте for або while." },
    ],
  },
  {
    ...base, id: "c-static-counter", lesson: "c/18", xp: 25,
    title: "Номерки в черзі: static усередині функції",
    context: "Лічильник викликів чи генератор номерів має пам'ятати значення між викликами. Для цього використовують static-змінну всередині функції, не вдаючись до глобальної змінної, яку можна зіпсувати звідусіль.",
    brief: [
      "Функція <code>next_ticket</code> у заготовці щоразу повертає 1, бо її змінна починається заново. Виправте її так, щоб три виклики підряд повертали <code>1 2 3</code>: зробіть лічильник <code>static</code>.",
      "У <code>main</code> результати вже збираються у змінні, і програма друкує <code>tickets: 1 2 3</code>. Четвертий виклик має вивести <code>after: 4</code>. Глобальні змінні не використовуйте.",
    ],
    starter: raw`#include <stdio.h>

int next_ticket(void) {
    int n = 0;
    n++;
    return n;
}

int main(void) {
    int a = next_ticket();
    int b = next_ticket();
    int c = next_ticket();
    printf("tickets: %d %d %d\n", a, b, c);
    int d = next_ticket();
    printf("after: %d\n", d);
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Три номерки підряд: 1 2 3", has: "tickets: 1 2 3", hint: "Лічильник має пережити виклик: static int n = 0;" },
      { on: "stdout", name: "Четвертий виклик повертає 4", has: "after: 4", hint: "Статична змінна ініціалізується один раз і продовжує рахувати." },
      { on: "stdout", name: "Обидва рядки без зайвого", equals: "tickets: 1 2 3\nafter: 4", hint: "main змінювати не потрібно, лише функцію next_ticket." },
      { on: "source", name: "Лічильник оголошено як static int", matches: "static\\s+int\\s+\\w+\\s*=\\s*0", hint: "static int n = 0; усередині next_ticket." },
    ],
  },
];
