// Практичні завдання глави «Основи мови», частина a (уроки 5–11). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_02a: readonly RemoteTask[] = [
  {
    ...base, id: "cpp-types-total", lesson: "cpp/5", xp: 20,
    title: "Сума замовлення, точність і ділення цілих",
    context: "За замовчуванням cout показує лише 6 значущих цифр, тож 599.97 перетворюється на 600. Для грошей потрібні fixed і setprecision. А ділення цілих у C++ відкидає дробову частину.",
    brief: [
      "Виведіть <code>Разом: 599.97</code>: сума <code>price * qty</code> із двома знаками після коми (<code>std::fixed</code> і <code>std::setprecision(2)</code> з <code>&lt;iomanip&gt;</code>).",
      "Другим рядком виведіть через пробіл результати <code>7 / 2</code> і <code>7 / 2.0</code>: <code>3 3.5</code>. Після <code>fixed</code> дроби друкуватимуться з двома знаками, тож поверніть звичайний режим маніпулятором <code>std::defaultfloat</code> або виведіть ці числа до <code>fixed</code>.",
    ],
    starter: raw`#include <iostream>
#include <iomanip>

int main() {
    double price = 199.99;
    int qty = 3;
    double total = price * qty;
    // TODO: Разом: 599.97 (fixed + setprecision(2)), а наступним рядком 7 / 2 і 7 / 2.0 через пробіл
    std::cout << "Разом: " << total << std::endl;
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Рядок «Разом: 599.97»", has: "Разом: 599.97", hint: "Без fixed cout округлить 599.97 до шести значущих цифр і покаже 600." },
      { on: "stdout", name: "Ділення цілих і дробових: 3 3.5", has: "3 3.5", hint: "7 / 2 дає ціле 3, а 7 / 2.0 дає 3.5; після fixed обидва вивелися б з двома знаками." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Разом: 599.97\n3 3.5", hint: "Рівно два рядки, нічого зайвого." },
      { on: "source", name: "Використано setprecision", has: "setprecision", hint: "Кількість знаків після коми задає маніпулятор з iomanip." },
    ],
  },
  {
    ...base, id: "cpp-init-const", lesson: "cpp/6", xp: 20,
    title: "Рахунок із const, фігурними дужками й auto",
    context: "Усе, що не змінюється, краще оголошувати const, а початкові значення писати у фігурних дужках: компілятор тоді сам вловить випадкову втрату даних або зайве присвоєння.",
    brief: [
      "Оголосіть <code>const int qty{4}</code> і <code>const double price{25.5}</code>, а суму отримайте через <code>auto total = price * qty;</code>.",
      "Виведіть два рядки: <code>Кількість: 4</code> і <code>Сума: 102</code>.",
    ],
    starter: raw`#include <iostream>

int main() {
    // TODO: const int qty{4}; const double price{25.5}; auto total = price * qty;
    int qty = 0;
    double total = 0;
    std::cout << "Кількість: " << qty << "\n";
    std::cout << "Сума: " << total << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Рядок «Кількість: 4»", has: "Кількість: 4", hint: "Змінна qty має отримати значення 4 під час ініціалізації." },
      { on: "stdout", name: "Рядок «Сума: 102»", has: "Сума: 102", hint: "Добуток 25.5 на 4 обчислює програма, а не ви вручну." },
      { on: "stdout", name: "Точний вивід", equals: "Кількість: 4\nСума: 102", hint: "Два рядки у вказаному порядку." },
      { on: "source", name: "Є const", has: "const", hint: "Вихідні дані не змінюються, тож позначте їх const." },
      { on: "source", name: "Є auto", has: "auto", hint: "Тип суми компілятор виведе зі значення праворуч." },
      { on: "source", name: "Фігурні дужки", matches: "qty\\s*\\{\\s*4\\s*\\}", hint: "Запишіть значення так: ім'я{значення}." },
    ],
  },
  {
    ...base, id: "cpp-int-overflow", lesson: "cpp/7", xp: 20,
    title: "Велика сума без переповнення",
    context: "Сума великої кількості значень легко виходить за межі int, а переповнення знакового числа дає хибні підсумки. Для лічильників і сум, що можуть вирости, беруть 64-бітний тип.",
    brief: [
      "У циклі від 1 до 100000 накопичте суму чисел у змінній типу <code>long long</code>. Виведіть її першим рядком: <code>5000050000</code>.",
      "Другим рядком виведіть залишок і частку цілого ділення 17 на 5 через пробіл: <code>3 2</code> (спершу частка, потім залишок).",
    ],
    starter: raw`#include <iostream>

int main() {
    // TODO: сума 1..100000 у long long
    long long sum = 0;
    std::cout << sum << "\n";
    // TODO: частка і залишок від ділення 17 на 5
    std::cout << 0 << " " << 0 << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Сума 5000050000", has: "5000050000", hint: "Змінна суми має вміщати значення понад два мільярди." },
      { on: "stdout", name: "Частка і залишок: 3 2", has: "3 2", hint: "Оператор / дає частку, а % дає залишок." },
      { on: "stdout", name: "Точний вивід", equals: "5000050000\n3 2", hint: "Два рядки: сума, потім частка й залишок." },
      { on: "source", name: "Тип long long", has: "long long", hint: "Тип int для такої суми замалий." },
    ],
  },
  {
    ...base, id: "cpp-string-basics", lesson: "cpp/8", xp: 20,
    title: "Розбір імені з рядка",
    context: "Розібрати рядок на частини за роздільником потрібно всюди: імена, шляхи, адреси, поля журналу. Основа цього find для пошуку позиції та substr для вирізання.",
    brief: [
      "Рядок <code>full</code> містить ім'я та прізвище через пробіл. Знайдіть пробіл методом <code>find</code> і виріжте частини методом <code>substr</code>.",
      "Виведіть три рядки: <code>Name: Taras</code>, <code>Surname: Petrenko</code> і <code>Length: 14</code> (довжина всього рядка).",
    ],
    starter: raw`#include <iostream>
#include <string>

int main() {
    std::string full = "Taras Petrenko";
    // TODO: знайдіть пробіл (find), виріжте ім'я та прізвище (substr), виведіть довжину (size)
    std::cout << "Name: " << full << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Рядок «Name: Taras»", has: "Name: Taras", hint: "Ім'я це частина рядка від початку до пробілу." },
      { on: "stdout", name: "Рядок «Surname: Petrenko»", has: "Surname: Petrenko", hint: "Прізвище починається на символ після пробілу." },
      { on: "stdout", name: "Точний вивід", equals: "Name: Taras\nSurname: Petrenko\nLength: 14", hint: "Три рядки в такому порядку: ім'я, прізвище, довжина." },
      { on: "source", name: "Використано find", has: "find", hint: "Позицію пробілу повертає метод find." },
      { on: "source", name: "Використано substr", has: "substr", hint: "Підрядок вирізає substr(початок, довжина)." },
    ],
  },
  {
    ...base, id: "cpp-stream-sum", lesson: "cpp/9", xp: 25,
    title: "Сума й середнє з потоку чисел",
    context: "Програми читають числа з вводу, поки вони є, і підбивають підсумок. Тут замість клавіатури рядковий потік, але цикл читання й форматований вивід такі самі, як із cin.",
    brief: [
      "Потік <code>in</code> містить числа через пробіл. Читайте їх циклом <code>while (in &gt;&gt; value)</code>, рахуючи кількість і суму.",
      "Виведіть три рядки: <code>Count: 4</code>, <code>Sum: 18</code> і <code>Average: 4.50</code> (середнє з двома знаками після коми через <code>fixed</code> і <code>setprecision(2)</code>).",
    ],
    starter: raw`#include <iomanip>
#include <iostream>
#include <sstream>

int main() {
    std::istringstream in("3 4 5 6");
    int value = 0;
    int count = 0;
    int sum = 0;
    // TODO: прочитайте всі числа з in, накопичте count і sum
    std::cout << "Count: " << count << "\n";
    std::cout << "Sum: " << sum << "\n";
    // TODO: Average з двома знаками після коми
    std::cout << "Average: " << value << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Рядок «Count: 4»", has: "Count: 4", hint: "Лічильник збільшується на кожне успішно прочитане число." },
      { on: "stdout", name: "Рядок «Sum: 18»", has: "Sum: 18", hint: "Додавайте value до суми всередині циклу читання." },
      { on: "stdout", name: "Середнє «Average: 4.50»", has: "Average: 4.50", hint: "Поділіть суму на кількість як на double й увімкніть fixed із setprecision(2)." },
      { on: "stdout", name: "Точний вивід", equals: "Count: 4\nSum: 18\nAverage: 4.50", hint: "Три рядки: кількість, сума, середнє." },
      { on: "source", name: "Цикл читання з потоку", matches: "while\\s*\\(\\s*in\\s*>>", hint: "Умова циклу це саме читання: while (in >> value)." },
    ],
  },
  {
    ...base, id: "cpp-convert-parse", lesson: "cpp/10", xp: 25,
    title: "Розбір чисел із тексту з обробкою помилок",
    context: "Текст із конфігурації чи вводу часто містить сміття. stoi кидає виняток на кривому рядку, тож розбір обгортають у try і catch, щоб один поганий токен не валив програму.",
    brief: [
      "Потік містить слова через пробіл. Кожне слово спробуйте перетворити через <code>std::stoi</code> усередині <code>try</code>; у <code>catch (const std::exception&amp;)</code> порахуйте його як помилкове.",
      "Виведіть три рядки: <code>Valid: 3</code>, <code>Bad: 2</code> і <code>Sum: 49</code>. Слова, що починаються не з числа, вважаються помилковими.",
    ],
    starter: raw`#include <iostream>
#include <sstream>
#include <string>

int main() {
    std::istringstream in("12 abc 7 x9 30");
    std::string word;
    int valid = 0;
    int bad = 0;
    int sum = 0;
    while (in >> word) {
        // TODO: спробуйте std::stoi(word) у try, помилку порахуйте в catch
        sum += 0;
    }
    std::cout << "Valid: " << valid << "\n";
    std::cout << "Bad: " << bad << "\n";
    std::cout << "Sum: " << sum << "\n";
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Рядок «Valid: 3»", has: "Valid: 3", hint: "Три слова з п'яти починаються з числа." },
      { on: "stdout", name: "Рядок «Bad: 2»", has: "Bad: 2", hint: "Помилкові слова ловіть у блоці catch." },
      { on: "stdout", name: "Рядок «Sum: 49»", has: "Sum: 49", hint: "Додавайте до суми лише успішно розібрані числа." },
      { on: "stdout", name: "Точний вивід", equals: "Valid: 3\nBad: 2\nSum: 49", hint: "Три рядки у вказаному порядку." },
      { on: "source", name: "Використано stoi", has: "stoi", hint: "Слово в число перетворює std::stoi." },
      { on: "source", name: "Є catch", has: "catch", hint: "Без try/catch програма впаде на першому ж слові abc." },
    ],
  },
  {
    ...base, id: "cpp-conditions-switch", lesson: "cpp/11", xp: 25,
    title: "Температури й сигнали: if, else if і switch",
    context: "Розбір значень на категорії й команд за кодом це щоденна робота: ланцюжок else if підходить для діапазонів, а switch для точних значень.",
    brief: [
      "Для кожної температури зі списку виведіть рядок <code>значення: категорія</code> за правилами: нижче 0 <code>freezing</code>, нижче 15 <code>cool</code>, нижче 30 <code>warm</code>, інакше <code>hot</code>. Використайте <code>else if</code>.",
      "Потім для кожного символу сигналу виведіть <code>символ: дія</code> через <code>switch</code>: <code>R</code> це <code>stop</code>, <code>G</code> це <code>go</code>, <code>Y</code> це <code>wait</code>, решта це <code>unknown</code>. Очікуваний вивід дивіться в перевірках.",
    ],
    starter: raw`#include <iostream>
#include <string>

int main() {
    int temps[] = {-5, 12, 25, 38};
    for (int t : temps) {
        // TODO: if / else if / else за правилами з постановки
        std::cout << t << ": " << "?" << "\n";
    }
    std::string signals = "RGYX";
    for (char s : signals) {
        // TODO: switch (s) з case 'R', 'G', 'Y' і default
        std::cout << s << ": " << "?" << "\n";
    }
    return 0;
}
`,
    checks: [
      { on: "stdout", name: "Категорії температур", has: "-5: freezing\n12: cool\n25: warm\n38: hot", hint: "Межі 0, 15 і 30; спершу перевіряйте найнижчу." },
      { on: "stdout", name: "Дії сигналів", has: "R: stop\nG: go\nY: wait\nX: unknown", hint: "Для невідомого символу потрібна гілка default." },
      { on: "stdout", name: "Точний вивід", equals: "-5: freezing\n12: cool\n25: warm\n38: hot\nR: stop\nG: go\nY: wait\nX: unknown", hint: "Спочатку чотири температури, потім чотири сигнали." },
      { on: "source", name: "Є else if", has: "else if", hint: "Діапазони перевіряються ланцюжком else if." },
      { on: "source", name: "Є switch", has: "switch", hint: "Символи сигналів розбирайте через switch." },
    ],
  },
];
