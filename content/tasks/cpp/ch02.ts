import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_02: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-basic-types", lesson: "cpp/5", xp: 20,
    title: "Картка успішності: правильні типи",
    context: "Правильно вибраний тип визначає, чи збережеться дріб, чи надрукується слово «true» і чи побачимо літеру замість коду. Ця картка зараз зберігає все в int і показує дивні значення.",
    brief: [
      "Виправте типи: сума балів <code>sum</code> і середнє <code>avg</code> мають бути <code>double</code>, прапорець <code>passed</code> — <code>bool</code>, оцінка <code>grade</code> — <code>char</code>.",
      "Щоб прапорець друкувався словом, увімкніть <code>std::boolalpha</code>. Очікуваний вивід: <code>Середній бал: 4.5</code>, <code>Склав: true</code>, <code>Оцінка: B</code>.",
    ],
    starter: raw`#include <iostream>

int main() {
    int sum = 18;
    int count = 4;
    int avg = sum / count;
    int passed = avg >= 4;
    int grade = 'B';
    std::cout << "Середній бал: " << avg << "\n";
    std::cout << "Склав: " << passed << "\n";
    std::cout << "Оцінка: " << grade << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Середній бал 4.5 (не 4)", has: "Середній бал: 4.5", hint: "Ділення цілих відкидає дріб: зробіть sum типу double, тоді sum / count дасть 4.5." },
      { on: "stdout", name: "Прапорець друкується словом true", has: "Склав: true", hint: "Змінна passed має бути bool, а перед виводом увімкніть std::boolalpha." },
      { on: "stdout", name: "Оцінка друкується літерою B", has: "Оцінка: B", hint: "Змінна grade типу int друкує код 66. З типом char буде літера." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Середній бал: 4.5\nСклав: true\nОцінка: B", hint: "Мають бути рівно три рядки у вказаному форматі." },
      { on: "source", name: "Використано типи double, bool і char", matches: "\\bdouble\\s+\\w+[\\s\\S]*\\bbool\\s+\\w+[\\s\\S]*\\bchar\\s+\\w+", hint: "Оголосіть змінні типів double, bool і char саме в такому порядку." },
    ],
  },
  {
    ...base, id: "cpp-init-const-auto", lesson: "cpp/6", xp: 20,
    title: "Рахунок із ПДВ: const, constexpr і auto",
    context: "Ставка податку й ціна не мають змінюватися під час розрахунку, тож їх позначають const. Магічні числа в середині виразів ховають зміст, а константа з назвою читається як опис.",
    brief: [
      "Зробіть ставку ПДВ константою часу компіляції: <code>constexpr int vat = 20;</code>. Ціну <code>price</code> і кількість <code>qty</code> оголосіть як <code>const</code> із фігурними дужками.",
      "Обчисліть через <code>auto</code> суму без ПДВ (<code>price * qty</code>), ПДВ (<code>net * vat / 100</code>) і підсумок. Очікуваний вивід: <code>Без ПДВ: 750</code>, <code>ПДВ: 150</code>, <code>Разом: 900</code>.",
    ],
    starter: raw`#include <iostream>

int main() {
    int price = 250;
    int qty = 3;
    int net = price * qty;
    int tax = 0;
    int total = net;
    std::cout << "Без ПДВ: " << net << "\n";
    std::cout << "ПДВ: " << tax << "\n";
    std::cout << "Разом: " << total << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Сума без ПДВ: 750", has: "Без ПДВ: 750", hint: "Ціна 250 помножена на кількість 3 дає 750." },
      { on: "stdout", name: "ПДВ 20% від 750: 150", has: "ПДВ: 150", hint: "ПДВ дорівнює net * vat / 100, де vat — константа 20." },
      { on: "stdout", name: "Разом: 900", has: "Разом: 900", hint: "Підсумок — сума без ПДВ плюс ПДВ." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Без ПДВ: 750\nПДВ: 150\nРазом: 900", hint: "Мають бути рівно три рядки." },
      { on: "source", name: "Ставка оголошена як constexpr", matches: "constexpr\\s+int\\s+vat\\s*[{=]", hint: "Напишіть constexpr int vat = 20; на початку main." },
      { on: "source", name: "Використано const і auto", matches: "\\bconst\\b[\\s\\S]*\\bauto\\b", hint: "Ціну й кількість зробіть const, а проміжні результати оголосіть через auto." },
    ],
  },
  {
    ...base, id: "cpp-int-limits", lesson: "cpp/7", xp: 25,
    title: "Межі цілих: limits, обертання й безпечна перевірка",
    context: "Розміри цілих типів і поведінку на межі перевіряють до того, як вони зіпсують розрахунок. Беззнакові числа обертаються за правилами, а перевірку суми роблять через різницю з максимумом.",
    brief: [
      "Підключіть <code>&lt;cstdint&gt;</code> і <code>&lt;limits&gt;</code>. Над <code>main</code> додайте <code>static_assert</code>, що <code>sizeof(std::int32_t) == 4</code>. Лічильник <code>level</code> типу <code>std::uint8_t</code> після <code>+= 10</code> з 250 надрукуйте числом (<code>int(level)</code>), максимум <code>int32_t</code> візьміть із <code>std::numeric_limits</code>.",
      "Беззнакове <code>zero</code> зменшіть на одиницю й надрукуйте. Для <code>a = 2147483000</code> і <code>b = 1000</code> перевірте без переповнення, чи вміщується <code>a + b</code> в <code>int</code> (<code>a &lt;= max - b</code>) і виведіть це через <code>std::boolalpha</code>. Очікується: <code>level: 4</code>, <code>int32 max: 2147483647</code>, <code>uint32 wrap: 4294967295</code>, <code>fits: false</code>.",
    ],
    starter: raw`#include <cstdint>
#include <iostream>
#include <limits>

int main() {
    std::uint8_t level = 250;
    level += 10;
    std::cout << "level: " << level << "\n";
    std::cout << "int32 max: " << 0 << "\n";
    std::uint32_t zero = 0;
    std::cout << "uint32 wrap: " << zero << "\n";
    std::cout << "fits: " << "yes" << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "level: 4 (число, а не символ)", has: "level: 4", hint: "uint8_t друкується як символ: перетворіть на число через int(level) або +level." },
      { on: "stdout", name: "Максимум int32: 2147483647", has: "int32 max: 2147483647", hint: "Візьміть значення з std::numeric_limits<std::int32_t>::max()." },
      { on: "stdout", name: "Беззнакове обертання: 4294967295", has: "uint32 wrap: 4294967295", hint: "Зробіть --zero; у беззнакового нуля мінус один дає максимум типу." },
      { on: "stdout", name: "Перевірка суми без переповнення", has: "fits: false", hint: "Обчисліть a <= std::numeric_limits<int>::max() - b, не додаючи a + b, і виведіть із boolalpha." },
      { on: "source", name: "Є static_assert на sizeof", matches: "static_assert\\s*\\(\\s*sizeof", hint: "Додайте static_assert(sizeof(std::int32_t) == 4, \"...\"); над main." },
    ],
  },
  {
    ...base, id: "cpp-float-precision", lesson: "cpp/8", xp: 25,
    title: "Порівняння дробів із допуском і NaN",
    context: "Тести й розрахунки, що порівнюють дроби через ==, ламаються через двійкову похибку. Надійний спосіб — модуль різниці з допуском, а NaN перевіряють спеціальною функцією.",
    brief: [
      "Для <code>sum = 0.1 + 0.2</code> виведіть строге порівняння з <code>0.3</code> (воно хибне), а в другому рядку порівняння з допуском <code>std::fabs(sum - 0.3) &lt; 1e-9</code> (істинне). Булеві значення друкуйте через <code>std::boolalpha</code>.",
      "Третім рядком виведіть <code>sum</code> із двома знаками (<code>fixed</code> і <code>setprecision(2)</code>), а четвертим результат <code>std::isnan(bad)</code> для NaN. Очікується: <code>рівні: false</code>, <code>близькі: true</code>, <code>сума: 0.30</code>, <code>nan: true</code>.",
    ],
    starter: raw`#include <iomanip>
#include <iostream>
#include <limits>

int main() {
    double a = 0.1;
    double b = 0.2;
    double sum = a + b;
    double bad = std::numeric_limits<double>::quiet_NaN();
    std::cout << std::boolalpha;
    std::cout << "рівні: " << (sum == 0.3) << "\n";
    std::cout << "близькі: " << (sum == 0.3) << "\n";
    std::cout << "сума: " << sum << "\n";
    std::cout << "nan: " << (bad == bad) << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Строге порівняння хибне", has: "рівні: false", hint: "sum == 0.3 дає false: 0.1 + 0.2 не дорівнює 0.3 точно." },
      { on: "stdout", name: "Порівняння з допуском істинне", has: "близькі: true", hint: "Порівняйте std::fabs(sum - 0.3) з малим допуском, наприклад 1e-9; потрібен заголовок <cmath>." },
      { on: "stdout", name: "Сума з двома знаками: 0.30", has: "сума: 0.30", hint: "Перед виводом sum додайте std::fixed << std::setprecision(2)." },
      { on: "stdout", name: "NaN розпізнано", has: "nan: true", hint: "bad == bad хибне для NaN. Використайте std::isnan(bad)." },
      { on: "source", name: "Допуск через fabs або abs", matches: "std::(fabs|abs)\\s*\\(", hint: "Візьміть модуль різниці: std::fabs(sum - 0.3)." },
    ],
  },
  {
    ...base, id: "cpp-types-total", lesson: "cpp/9", xp: 20,
    title: "Середнє, обрізання й символ: static_cast",
    context: "Ділення цілих відкидає дріб, а перетворення дробу в ціле мовчки обрізає його. Явний static_cast показує, що саме перетворюється, і дає правильний результат там, де це потрібно.",
    brief: [
      "Середнє <code>total / count</code> для 7 і 2 зараз дає 3.00. Перетворіть <code>total</code> на <code>double</code> через <code>static_cast&lt;double&gt;</code> перед діленням і виведіть із <code>fixed</code> та <code>setprecision(2)</code>: <code>Середнє: 3.50</code>.",
      "Другим рядком виведіть <code>7.9</code>, явно обрізане через <code>static_cast&lt;int&gt;</code>: <code>Обрізано: 7</code>. Третім виведіть символ із коду 65 через <code>static_cast&lt;char&gt;</code>: <code>Символ: A</code>.",
    ],
    starter: raw`#include <iomanip>
#include <iostream>

int main() {
    int total = 7;
    int count = 2;
    double avg = total / count;
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "Середнє: " << avg << "\n";
    std::cout << "Обрізано: " << 7.9 << "\n";
    std::cout << "Символ: " << 65 << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Середнє 3.50", has: "Середнє: 3.50", hint: "Перетворіть операнд до ділення: static_cast<double>(total) / count." },
      { on: "stdout", name: "Обрізано до 7", has: "Обрізано: 7\n", hint: "static_cast<int>(7.9) відкидає дробову частину; після fixed цілі числа друкуються без дробу." },
      { on: "stdout", name: "Символ A з коду 65", has: "Символ: A", hint: "static_cast<char>(65) дає літеру A, і cout друкує її як символ." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Середнє: 3.50\nОбрізано: 7\nСимвол: A", hint: "Мають бути рівно три рядки у вказаному форматі." },
      { on: "source", name: "Використано static_cast<double>, <int> і <char>", matches: "static_cast\\s*<\\s*double\\s*>[\\s\\S]*static_cast\\s*<\\s*int\\s*>[\\s\\S]*static_cast\\s*<\\s*char\\s*>", hint: "Потрібні три касти: double для ділення, int для обрізання, char для символа." },
    ],
  },
  {
    ...base, id: "cpp-string-email", lesson: "cpp/10", xp: 25,
    title: "Розбір e-mail: find, substr і replace",
    context: "Адреси, шляхи й рядки журналів розбирають за роздільниками. Метод find знаходить позицію, substr вирізає частину, replace підміняє фрагмент: цього вистачає для більшості простого парсингу.",
    brief: [
      "Для рядка <code>artem@example.com</code> знайдіть позицію <code>@</code> через <code>find</code> і виведіть ім'я користувача (<code>substr</code> до неї) та домен (<code>substr</code> після неї), а також довжину всієї адреси через <code>size()</code>.",
      "Потім замініть домен на <code>iteris.dev</code> методом <code>replace</code> і виведіть нову адресу. Очікується: <code>Користувач: artem</code>, <code>Домен: example.com</code>, <code>Довжина: 17</code>, <code>Нова адреса: artem@iteris.dev</code>.",
    ],
    starter: raw`#include <iostream>
#include <string>

int main() {
    std::string email = "artem@example.com";
    std::cout << "Користувач: " << email << "\n";
    std::cout << "Домен: " << email << "\n";
    std::cout << "Довжина: " << 0 << "\n";
    std::cout << "Нова адреса: " << email << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Користувач: artem", has: "Користувач: artem\n", hint: "Підрядок від початку до позиції @: email.substr(0, at)." },
      { on: "stdout", name: "Домен: example.com", has: "Домен: example.com", hint: "Підрядок після @: email.substr(at + 1)." },
      { on: "stdout", name: "Довжина 17", has: "Довжина: 17", hint: "Довжину повертає email.size()." },
      { on: "stdout", name: "Нова адреса з iteris.dev", has: "Нова адреса: artem@iteris.dev", hint: "email.replace(at + 1, domain.size(), \"iteris.dev\") замінює домен." },
      { on: "source", name: "Використано find, substr і replace", matches: "\\.find\\s*\\([\\s\\S]*\\.substr\\s*\\([\\s\\S]*\\.replace\\s*\\(", hint: "Знайдіть @ через find, вирізайте substr і підміняйте домен через replace." },
    ],
  },
  {
    ...base, id: "cpp-stream-table", lesson: "cpp/11", xp: 25,
    title: "Розбір рядка потоком і таблиця зі setw",
    context: "Дані з файлів і консолі спершу розбирають потоком за типами, а потім виводять охайною таблицею. Ввід імітуємо через istringstream: у справжній програмі тут був би std::cin.",
    brief: [
      "Із потоку <code>in</code> із рядка <code>Apple 3 12.5</code> прочитано <code>item</code>, <code>qty</code>, <code>price</code>. Виведіть шапку й рядок таблиці: назва — ліворуч у 8 позиціях, кількість — праворуч у 5, ціна — праворуч у 8 (<code>std::setw</code>, <code>std::left</code>, <code>std::right</code>).",
      "Ціну друкуйте з двома знаками (<code>fixed</code> і <code>setprecision(2)</code>). Третім рядком виведіть <code>Total: 37.50</code> — добуток кількості й ціни.",
    ],
    starter: raw`#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>

int main() {
    std::istringstream in("Apple 3 12.5");
    std::string item;
    int qty = 0;
    double price = 0;
    in >> item >> qty >> price;
    std::cout << item << " " << qty << " " << price << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Шапка таблиці", has: "Item      Qty   Price", hint: "Item ліворуч у 8 позиціях, Qty праворуч у 5, Price праворуч у 8: setw перед кожним значенням." },
      { on: "stdout", name: "Рядок товару з вирівнюванням", has: "Apple       3   12.50", hint: "Ціна з fixed і setprecision(2), кількість праворуч у 5 позиціях." },
      { on: "stdout", name: "Підсумок: Total: 37.50", has: "Total: 37.50", hint: "Помножте qty на price й виведіть із двома знаками." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Item      Qty   Price\nApple       3   12.50\nTotal: 37.50", hint: "Мають бути рівно три рядки без зайвих пробілів між стовпчиками." },
      { on: "source", name: "Використано setw", has: "setw", hint: "Ширину стовпчика задає std::setw з <iomanip>." },
    ],
  },
];
